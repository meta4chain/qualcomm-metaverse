import * as THREE from '../node_modules/three/build/three.module.js';

let volume = 1
// export default function createVideo(scene, level) {
//     console.log("loading video")
//     const video = document.getElementById("video")
//     console.log(video)
//     video.load()
//     video.play()
//     let videoTexture = new THREE.VideoTexture(video)
//     videoTexture.minFilter = THREE.LinearFilter
//     videoTexture.magFilter = THREE.LinearFilter
//     videoTexture.format = THREE.RGBFormat

//     let videoObject = new THREE.Mesh(
//         new THREE.PlaneGeometry(3, 1.6),
//         new THREE.MeshBasicMaterial( { map: videoTexture } )
//     )

//     videoObject.position.set(-3.15, -0.85, -1.39)
//     videoObject.autoplay = true
//     videoObject.rotation.set(0, 179.07, 0)
//     videoObject.name = "movieVideo"
//     console.log(scene)
//     scene.add(videoObject)
//     console.log("video added")

// }

export default class CreateVideo {
    constructor(scene, level) {
        this.scene = scene
        this.level = level
        this.video1Boolean = false
        this.video2Boolean = false
        this.video3Boolean = false
        this.video4Boolean = false
        this.goldParams = [ // Mudei para um array de objetos pois assim consigo trabalhar melhor com o for e a função fica melhor utilizada
            { // Video 1
                videoPosition: {
                    "x": -3.1,
                    "y": -1,
                    "z": -1.39
                },
                videoRotation: {
                    "x": 0,
                    "y": 179.07,
                    "z": 0
                }
            },
            { // Video 2
                videoPosition: {
                    "x": -3.15,
                    "y": -0.85,
                    "z": -15.96
                },
                videoRotation: {
                    "x": 0,
                    "y": 0,
                    "z": 0
                }
            },
            { // Video 3
                videoPosition: {
                    "x": 20.9,
                    "y": -0.85,
                    "z": -1.39
                },
                videoRotation: {
                    "x": 0,
                    "y": 179.07,
                    "z": 0
                }
            },
            { //Video 4
                videoPosition: {
                    "x": 20.905,
                    "y": -0.85,
                    "z": -15.96
                },
                videoRotation: {
                    "x": 0,
                    "y": 0,
                    "z": 0
                }
            }
        ]

        this.goldParamsImages = [ // Mudei para um array de objetos pois assim consigo trabalhar melhor com o for e a função fica melhor utilizada
            { // Video 1
                videoPosition: {
                    "x": -3.2,
                    "y": -0.85,
                    "z": -1.4
                },
                videoRotation: {
                    "x": 0,
                    "y": 179.07,
                    "z": 0
                }
            },
            { // Video 2
                videoPosition: {
                    "x": -3.14,
                    "y": -0.84,
                    "z": -15.97
                },
                videoRotation: {
                    "x": 0,
                    "y": 0.002,
                    "z": 0
                }
            },
            { // Video 3
                videoPosition: {
                    "x": 20.9,
                    "y": -0.85,
                    "z": -1.4
                },
                videoRotation: {
                    "x": 0,
                    "y": 179.07,
                    "z": 0
                }
            },
            { //Video 4
                videoPosition: {
                    "x": 20.905,
                    "y": -0.85,
                    "z": -15.94
                },
                videoRotation: {
                    "x": 0,
                    "y": 0,
                    "z": 0
                }
            },
            { //Video 5
                videoPosition: {
                    "x": -11.65,
                    "y": 2,
                    "z": -9
                },
                videoRotation: {
                    "x": 0,
                    "y": -80.11,
                    "z": 0
                }
            },
        ]
    }

    loadVideo(mobileControls) {
        this._loadImageStatic()
        const video = document.getElementById("video1")
        video.load()
        let videoTexture = new THREE.VideoTexture(video)
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        let videoObject = new THREE.Mesh(new THREE.PlaneGeometry(11, 6), new THREE.MeshBasicMaterial({ map: videoTexture }))
        videoObject.position.set(29.7, 3.25, -8.75)
        videoObject.rotation.set(0, 80.11, 0)
        videoObject.name = "video1"
        this.scene.add(videoObject)

        video.play()


        // Snapdragon video 
        const snapdragon = document.getElementById("snapdragon")
        snapdragon.load()
        let videoTexture2 = new THREE.VideoTexture(snapdragon)
        videoTexture2.minFilter = THREE.LinearFilter
        videoTexture2.magFilter = THREE.LinearFilter
        let videoObject2 = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 1.6), new THREE.MeshBasicMaterial({ map: videoTexture2 }))
        videoObject2.position.set(-3.12, -0.85, -1.4)
        videoObject2.rotation.set(0, 179.07, 0)
        videoObject2.name = "snapdragon"
        this.scene.add(videoObject2)
        snapdragon.play()

    }

    _loadImageStatic() {
        let imgArr = ['../files/QVesting/qc5g.jpeg', '../files/QVesting/leading5g.png', '../files/QVesting/image020.jpg', '../files/QVesting/image021.jpg']

        for(var i = 1; i <= 3; i++) {
            let planeGeometry = new THREE.PlaneGeometry(2.9, 1.55)
            let texture = new THREE.TextureLoader().load(imgArr[i])
            let planeMaterial = new THREE.MeshLambertMaterial({ map: texture, DoubleSide: true, transparent: true })

            var plane = new THREE.Mesh(planeGeometry, planeMaterial)
            plane.position.set(this.goldParamsImages[i].videoPosition.x, this.goldParamsImages[i].videoPosition.y, this.goldParamsImages[i].videoPosition.z)
            plane.rotation.set(this.goldParamsImages[i].videoRotation.x, this.goldParamsImages[i].videoRotation.y, this.goldParamsImages[i].videoRotation.z)
            if(i == 0) {
                plane.visible = false
            }
            this.scene.add(plane)
        }


        let balloonplaneGeometry = new THREE.PlaneGeometry(1.5, 1.5)
        let balloonTexture = new THREE.TextureLoader().load('../files/QVesting/balao1.png')
        let balloonTexture1 = new THREE.TextureLoader().load('../files/QVesting/balao2.png')
        let balloonTexture2 = new THREE.TextureLoader().load('../files/QVesting/balao3.png')
        
        let balloonPlaneMaterial = new THREE.MeshLambertMaterial({ map: balloonTexture1, DoubleSide: true, transparent: true })
        

        
        var ballooplane = new THREE.Mesh(balloonplaneGeometry, balloonPlaneMaterial)
        ballooplane.position.set(3, 0, -6)
        ballooplane.rotation.set(0, 80.11, 0)
        ballooplane.name = "balloon"
        this.scene.add(ballooplane)
        
        let image = 0
        window.setInterval( () => {
                if(image > 2){
                image = 0;
                balloonPlaneMaterial.map = balloonTexture
                }            
               if(image == 1){
                balloonPlaneMaterial.map = balloonTexture1
                }
                else if(image == 2){
                    balloonPlaneMaterial.map = balloonTexture2
                    }
                balloonPlaneMaterial.needsUpdate = true
                    
                image++
            
          } , 3500);

        let buttonInfoGeometry = new THREE.PlaneGeometry(0.5, 0.5)
        let buttonInfoTexture = new THREE.TextureLoader().load('../files/QVesting/info.png')
        let buttonInfoPlaneMaterial = new THREE.MeshLambertMaterial({ map: buttonInfoTexture, transparent: true, DoubleSide: true})

        let buttonInfoObject = new THREE.Mesh(buttonInfoGeometry, buttonInfoPlaneMaterial)
        buttonInfoObject.position.set(-1.2, -0.85, -1.35)
        buttonInfoObject.rotation.set(0, 179.07, 0)

        buttonInfoObject.name = 'snapdragoninfo'

        this.scene.add(buttonInfoObject)

        let buttonInfoObject2 = new THREE.Mesh(buttonInfoGeometry, buttonInfoPlaneMaterial)
        buttonInfoObject2.position.set(-1.2, -0.85, -15.99)
        buttonInfoObject2.rotation.set(0, 0, 0)

        buttonInfoObject2.name = 'metaverseFund'
        this.scene.add(buttonInfoObject2)
        

        let buttonInfoObject3 = new THREE.Mesh(buttonInfoGeometry, buttonInfoPlaneMaterial)
        buttonInfoObject3.position.set(22.9, -0.85, -15.98)
        buttonInfoObject3.rotation.set(0, 0, 0)

        buttonInfoObject3.name = 'ARDistributed'
        this.scene.add(buttonInfoObject3)


        let buttonInfoObject4 = new THREE.Mesh(buttonInfoGeometry, buttonInfoPlaneMaterial)
        buttonInfoObject4.position.set(22.9, -0.85, -1.4)
        buttonInfoObject4.rotation.set(0, 179.07, 0)
        AREcosystem
        buttonInfoObject4.name = 'AREcosystem'
        this.scene.add(buttonInfoObject4)

        let buttonInfoGeometry5 = new THREE.PlaneGeometry(1, 1)
        let buttonInfoObject5 = new THREE.Mesh(buttonInfoGeometry5, buttonInfoPlaneMaterial)
        buttonInfoObject5.position.set(29.7, -0.5, -13.75)
        buttonInfoObject5.rotation.set(0, 80.11, 0)
        buttonInfoObject5.name = 'AR2'
        this.scene.add(buttonInfoObject5)

        let buttonInfoGeometry6 = new THREE.PlaneGeometry(1, 1)
        let buttonInfoTexture6 = new THREE.TextureLoader().load('../files/QVesting/link.png')
        let buttonInfoPlaneMaterial6 = new THREE.MeshLambertMaterial({ map: buttonInfoTexture6, transparent: true, DoubleSide: true})
        let buttonInfoObject6 = new THREE.Mesh(buttonInfoGeometry6, buttonInfoPlaneMaterial6)

        buttonInfoObject6.position.set(29.7, -0.5, -12.75)
        buttonInfoObject6.rotation.set(0, 80.11, 0)
        buttonInfoObject6.name = 'AR2-link'
        this.scene.add(buttonInfoObject6)

        let buttonInfoObject7 = new THREE.Mesh(buttonInfoGeometry, buttonInfoPlaneMaterial6)
        
        buttonInfoObject7.position.set(-1.2, -1.35, -15.99)
        buttonInfoObject7.rotation.set(0, 0, 0)
        buttonInfoObject7.name = 'metaverseFund-link'
        this.scene.add(buttonInfoObject7)

        
    }

    _addVideoOnScene(videoController, video, level, params) {
        if (level === "gold") {
            video.position.set(params.videoPosition.x, params.videoPosition.y, params.videoPosition.z)
            video.rotation.set(params.videoRotation.x, params.videoRotation.y, params.videoRotation.z)
            this.scene.add(video)
            // setTimeout(videoController.play(), 10000)
        }
    }

    updateVideoVolume(camera, mobileControls, mutedControlsButton) {
        
        const maxDistance = 500;
        

        // for (var i = 1; i < 2; i++) { // @TODO POSITIONAL AUDIO with rotation 
            const video = document.getElementById("video1" )
            let distanceBetweenPlayerVideo = camera.position.distanceToSquared(this.scene.getObjectByName("video1").position)
            //  console.log("distance: " + distanceBetweenPlayerVideo)
            

            if(distanceBetweenPlayerVideo < maxDistance){
                if(!mutedControlsButton){
                    if(!mobileControls.detectiOS()){
                        // console.log("mutedControlsButton " + mutedControlsButton)
                        video.muted = false;
                    } 
                }
                // console.log(video.muted)
        
                volume = Math.max( 0, 1 - 1/maxDistance * distanceBetweenPlayerVideo )
            }
            else{
                volume = 0                
            }    
                
            if (isNaN(volume) || !isFinite(volume)){
                volume = 0
            }
            // console.log("video " + i + ": " + volume)
            video.volume = parseFloat(volume)

            
        // }
    }
}
