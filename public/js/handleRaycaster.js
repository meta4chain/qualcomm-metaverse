import * as THREE from '../node_modules/three/build/three.module.js';

export default class HandleRaycaster{
    constructor(raycaster) {
        this.raycaster = raycaster
    }

    raycasterUpdate(camera) {
        let origin = camera.position.clone()
        origin.set(origin.x, origin.y - 2.5, origin.z)

        this.raycaster.set(origin, new THREE.Vector3(0, -1, 0))

        var intersectionsDown = this.raycaster.intersectObjects(this.getCollidables())

        var onObject = intersectionsDown.length > 0 && intersectionsDown[0].distance < 0.25
    }

    intersectObjects(pointer, camera, scene){
        this.raycaster.setFromCamera(pointer, camera)

        const intersects = this.raycaster.intersectObjects(scene.children)

        for(let i = 0; i < intersects.length; i++) {
            if(intersects[i].object.name == "snapdragoninfo") {
                let doc = document.getElementById("snapdragonvideo")
                doc.style.display = "flex";
            }
            else if(intersects[i].object.name == "metaverseFund") {
                let doc = document.getElementById("metaverseFund")
                doc.style.display = "flex";
            }
            else if(intersects[i].object.name == "metaverseFund-link") {
                let url = "https://www.qualcomm.com/products/application/xr-vr-ar/snapdragon-metaverse-fund" 
                window.open(url, '_blank').focus();
            }


            else if(intersects[i].object.name == "AREcosystem") {
                let doc = document.getElementById("AREcosystem")
                doc.style.display = "flex";
            }
            else if(intersects[i].object.name == "ARDistributed") {
                let doc = document.getElementById("ARDistributed")
                doc.style.display = "flex";
            }
            else if(intersects[i].object.name == "AR2") {
                let video = document.getElementById("video1" )
                if(!(typeof DeviceMotionEvent.requestPermission === 'function')){
                console.log("entered here")
                video.pause();
                }
                let doc = document.getElementById("AR2")
                doc.style.display = "flex";

            }
            else if(intersects[i].object.name == "AR2-link") {
                let url = "https://www.qualcomm.com/news/releases/2022/11/qualcomm-launches-snapdragon-ar2-designed-to-revolutionize-ar-gl?mkt_tok=Mzg1LVRXUy04MDMAAAGIIbKH3emPbTjwV-OzrDY6rQpliMGRlc7vnDfPXv9VSJIbibJ39bClriEgnFxg-ifDfm2gBQ8c31iDKIvG_mWYiu8C0LR9cNGEQH8CAcY-qXJ0r3U" 
                window.open(url, '_blank').focus();
            }


            // else {
                // console.log(intersects[i])
            // }
        }
    }

    getCollidables() {
        return 0
    }
}