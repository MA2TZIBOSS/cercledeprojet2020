(function() {
    // Set our main variables
    let scene,
        renderer,
        camera,
        model,                              // Our character
        neck,                               // Reference to the neck bone in the skeleton
        waist,                               // Reference to the waist bone in the skeleton
        possibleAnims,                      // Animations found in our file
        mixer,                              // THREE.js animations mixer
        idle,                               // Idle, the default state our character returns to
        clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate
        currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
        loaderAnim = document.getElementById('js-loader'),
        scrollPos = window.scrollY

    init()

    function init() {

        const canvas = document.querySelector('#c');
        // Init the scene
        scene = new THREE.Scene()

        // Init the renderer
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setPixelRatio(window.devicePixelRatio)
        document.body.appendChild(renderer.domElement)

        // Add a camera
        camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            150
        )
        camera.position.z = 90
        camera.position.x = 0
        camera.position.y = 35
        camera.lookAt (new THREE.Vector3(0,0,0))
        // let controls = new THREE.OrbitControls(camera, renderer.domElement)
        // controls.enableZoom = false
        // controls.enablePan = false

        let stacy_txt = new THREE.TextureLoader().load('./model/Poupi.png')
        stacy_txt.flipY = false
        const stacy_mtl = new THREE.MeshPhongMaterial({
            map: stacy_txt,
            color: 0xffffff,
            skinning: true
        })


        var loader = new THREE.GLTFLoader()

        loader.load(
            './model/Poupi.glb',
            function(gltf) {
                model = gltf.scene;
                let fileAnimations = gltf.animations;

                model.traverse(o => {
                    if (o.isMesh) {

                        o.castShadow = true
                        o.receiveShadow = true
                        o.material = stacy_mtl
                    }
                    // Reference the neck and waist bones
                    if (o.isBone && o.name === 'Bone010') {
                        neck = o
                    }
                    if (o.isBone && o.name === 'Bone007') {
                        waist = o
                    }
                })

                model.scale.set(5, 5, 5)
                model.position.y = -15

                scene.add(model)

                loaderAnim.remove()

                mixer = new THREE.AnimationMixer(model)
                let clips = fileAnimations.filter(val => val.name !== '[Pile d’actions].008')
                possibleAnims = clips.map(val => {
                        let clip = THREE.AnimationClip.findByName(clips, val.name)
                        clip = mixer.clipAction(clip)
                        return clip
                    }
                )

                let idleAnim = THREE.AnimationClip.findByName(fileAnimations, '[Pile d’actions].008')
                idleAnim.tracks.splice(3, 3)
                idleAnim.tracks.splice(24, 3)

                idle = mixer.clipAction(idleAnim)
                idle.play()
            },
            undefined, // We don't need this function
            function(error) {
                console.error(error)
            }
        );

        // Add lights
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61)
        hemiLight.position.set(0, 50, 0)
        // Add hemisphere light to scene
        scene.add(hemiLight)

        let d = 8.25
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
        dirLight.position.set(-8, 12, 8)
        dirLight.castShadow = true
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
        dirLight.shadow.camera.near = 0.1
        dirLight.shadow.camera.far = 1500
        dirLight.shadow.camera.left = d * -1
        dirLight.shadow.camera.right = d
        dirLight.shadow.camera.top = d
        dirLight.shadow.camera.bottom = d * -1
        // Add directional Light to scene
        scene.add(dirLight)
    }


    function update() {
        if (mixer) {
            mixer.update(clock.getDelta());
        }

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(update);
    }

    update();

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        let width = window.innerWidth
        let height = window.innerHeight
        let canvasPixelWidth = canvas.width / window.devicePixelRatio;
        let canvasPixelHeight = canvas.height / window.devicePixelRatio;

        const needResize =
            canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    window.addEventListener('click', e => randAnim())
    window.addEventListener('touchend', e => randAnim())

    function randAnim() {
        if (!currentlyAnimating) {
            currentlyAnimating = true
            playOnClick()
        }
    }
    // Get a random animation, and play it
    function playOnClick() {
        let anim = Math.floor(Math.random() * possibleAnims.length)
        playModifierAnimation(idle, 0.9, possibleAnims[anim], 0.9)
    }

    function playModifierAnimation(from, fSpeed, to, tSpeed) {
        to.setLoop(THREE.LoopOnce)
        to.reset()
        to.play()
        from.crossFadeTo(to, fSpeed, true)
        setTimeout(function() {
            from.enabled = true
            to.crossFadeTo(from, tSpeed, true)
            currentlyAnimating = false
        }, to._clip.duration * 1000)
    }
    let mousecoords
    document.addEventListener('mousemove', function(e) {
         mousecoords = getMousePos(e)
        if (neck && waist) {
            moveJoint(mousecoords, neck, 50)
            moveJoint(mousecoords, waist, 30)
        }
    })
    document.addEventListener('touchmove', function(e) {
        mousecoords = getMousePos(e.touches[0])
        if (neck && waist) {
            moveJoint(mousecoords, neck, 50)
            moveJoint(mousecoords, waist, 30)
        }
    })
    window.addEventListener('scroll', function(e) {
        scrollPos = window.scrollY
    })

    function getMousePos(e) {
        return { x: e.clientX, y: e.clientY+scrollPos }
    }

    function moveJoint(mouse, joint, degreeLimit) {
        if (!currentlyAnimating){
            let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
            joint.rotation.y = THREE.Math.degToRad(degrees.x)
            joint.rotation.x = THREE.Math.degToRad(degrees.y)
        }
    }

    function getMouseDegrees(x, y, degreeLimit) {
        let dx = 0,
            dy = 0,
            xdiff,
            xPercentage,
            ydiff,
            yPercentage

        let w = { x: window.innerWidth, y: window.innerHeight }

        // Left (Rotates neck left between 0 and -degreeLimit)
        // 1. If cursor is in the left half of screen
        if (x <= w.x / 2) {
            // 2. Get the difference between middle of screen and cursor position
            xdiff = w.x / 2 - x
            // 3. Find the percentage of that difference (percentage toward edge of screen)
            xPercentage = (xdiff / (w.x / 2)) * 100
            // 4. Convert that to a percentage of the maximum rotation we allow for the neck
            dx = ((degreeLimit * xPercentage) / 100) * -1
        }

        // Right (Rotates neck right between 0 and degreeLimit)
        if (x >= w.x / 2) {
            xdiff = x - w.x / 2
            xPercentage = (xdiff / (w.x / 2)) * 100
            dx = (degreeLimit * xPercentage) / 100
        }
        // Up (Rotates neck up between 0 and -degreeLimit)
        if (y <= w.y / 2) {
            ydiff = w.y / 2 - y
            yPercentage = (ydiff / (w.y / 2)) * 100
            // Note that I cut degreeLimit in half when she looks up
            dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1
        }
        // Down (Rotates neck down between 0 and degreeLimit)
        if (y >= w.y / 2) {
            ydiff = y - w.y / 2
            yPercentage = (ydiff / (w.y / 2)) * 100
            dy = (degreeLimit*0.6 * yPercentage) / 100
        }
        return { x: dx, y: dy-15>degreeLimit?degreeLimit:dy-15 }
    }

})()
