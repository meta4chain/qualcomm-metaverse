
import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import { Octree } from './node_modules/three/examples/jsm/math/Octree.js';
import { OctreeHelper } from './node_modules/three/examples/jsm/helpers/OctreeHelper.js';

import { Capsule } from './node_modules/three/examples/jsm/math/Capsule.js';

import CreateVideo from './js/loadVideo.js'
import { LoadingBar } from './js/loadingBar.js';
import HandleRaycaster from './js/handleRaycaster.js';
import {mixer, CharacterSpawn} from './js/characterSpawn.js';

import MobileControls from './js/mobileControls.js';
import MenuControl from './js/MenuControl.js';

let localMediaStream = null
let menuControl = new MenuControl()
let pointer = new THREE.Vector2()
let peers = {}
let isMouseDown = false;
let level
let createVideo;

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const GRAVITY = 30;
// const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;
const STEPS_PER_FRAME = 5;
// const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 2);
// const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xbbbb44 });
const worldOctree = new Octree();
const container = document.getElementById('contentWrapper');
const buttonMute = document.getElementById('mic-off-button')
const camOffButton = document.getElementById('cam-off-button')

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
let playerOnFloor = false;
let mouseTime = 0;
const keyStates = {};
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();
let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

const spheres = [];
let sphereIdx = 0;
let renderer

let diamondPlayerPosition = [new THREE.Vector3(-5, 0.35, -14), new THREE.Vector3(-5, 1.5, -14), 0.35]
let goldPlayerPosition = [new THREE.Vector3(-10, 0.35, -8), new THREE.Vector3(-10, 1.5, -8), 0.35]
let silverPlayerPosition = [new THREE.Vector3(20, 3, -10), new THREE.Vector3(20, 4, -10), 0.35]
let silverPlayerRotation = [0, -89.5, 0]
let goldPlayerRotation = [0, -89.5, 0]
let diamondPlayerRotation = [0, -89.5, 0]
let playerCollider;
let raycaster;
let handleRaycaster
let mobileControls;

class Index {
    constructor() {
       
        console.log("Index Constructor")

        onStartControls(this);

        // const queryString = window.location.search;
        // const urlParams = new URLSearchParams(queryString);
        level = 'gold'
        console.log(level);
        setPlayerPosition(level)

        console.log("Entered on Index Constructor")
        const videoWidth = 360
        const videoHeight = 240
        const videoFrameRate = 15

        window.onbeforeunload = () => {
            return 'hey'
        }
        // document.addEventListener('keydown', (e) => {
            
        //     if((e.keyCode == 116)) {
        //         alert('Não é permitido usar F5')
        //         e.preventDefault()
        //     }
        // })

        let mediaConstraints = {
            audio: true,
            video: {
                width: videoWidth,
                height: videoHeight,
                frameRate: videoFrameRate
            }
        }


        window.onload = async () => {
            try {
                let micOffBoolean = false
                let camOffBoolean = false
                console.log("window.onLoad")
                localMediaStream = await this.getMedia(mediaConstraints)

                this.createLocalVideoElement()

                this.initSocketConnection(peers)

                setInterval(() => {
                    this.mySocket.emit("move", getPlayerPosition())
                }, 200)

                buttonMute.addEventListener('click', (e) => {
                    
                    if(!micOffBoolean)
                    {
                        console.log('mic off')
                        localMediaStream.getAudioTracks()[0].enabled = false
                        micOffBoolean = true
                    }
                    else {
                        console.log('mic on')
                        localMediaStream.getAudioTracks()[0].enabled = true
                        micOffBoolean = false
                    }
                })

                camOffButton.addEventListener('click', (e) => {
                    if(!camOffBoolean) {
                        console.log('cam off')
                        localMediaStream.getVideoTracks()[0].enabled = false
                        camOffBoolean = true
                    } else {
                        console.log('cam on')
                        localMediaStream.getVideoTracks()[0].enabled = true
                        camOffBoolean = false
                    }
                })
            } catch (e) {
                console.error(e)
            }
            
        }

        onStart(level)

          

        this.animate();
    }


    createPeerConnection(theirSocketId, isInitiator = false) {
        console.log('Connecting to peer with ID', theirSocketId);
        console.log('initiating?', isInitiator);

        let peerConnection = new SimplePeer({ initiator: isInitiator })
        // simplepeer generates signals which need to be sent across socket
        peerConnection.on("signal", (data) => {
            // console.log('signal');
            this.mySocket.emit("signal", theirSocketId, this.mySocket.id, data);
        });

        // When we have a connection, send our stream
        peerConnection.on("connect", () => {
            // Let's give them our stream
            peerConnection.addStream(localMediaStream);
            console.log("Send our stream");
        });

        // Stream coming in to us
        peerConnection.on("stream", (stream) => {
            console.log("Incoming Stream");

            this.updateClientMediaElements(theirSocketId, stream);
        });

        peerConnection.on("close", () => {
            console.log("Got close event");
            // Should probably remove from the array of simplepeers
        });

        peerConnection.on("error", (err) => {
            console.log(err);
        });

        return peerConnection;
    }

    disableOutgoingStream() {
        localMediaStream.getTracks().forEach((track) => {
            track.enabled = false;
        });
    }
    // enable the outgoing stream
    enableOutgoingStream() {
        localMediaStream.getTracks().forEach((track) => {
            track.enabled = true;
        });
    }

    async getMedia(_mediaConstraints) {
        let stream = null;

        try {
            stream = await navigator.mediaDevices.getUserMedia(_mediaConstraints)

        } catch (err) {
            console.warn(err);
        }
    
        return stream;
    }

    initSocketConnection(peers) {
        console.log("Initializing socket.io...");
        this.mySocket = io();

        // mySocket = io();

        this.mySocket.on("connect", () => {
            console.log("My socket ID:", this.mySocket.id);
        });

        //On connection server sends the client his ID and a list of all keys
        this.mySocket.on("introduction", (otherClientIds) => {

            // for each existing user, add them as a client and add tracks to their peer connection
            for (let i = 0; i < otherClientIds.length; i++) {
                if (otherClientIds[i] != this.mySocket.id) {
                    let theirId = otherClientIds[i];

                    console.log("Adding client with id " + theirId);
                    peers[theirId] = {};

                    let pc = this.createPeerConnection(theirId, true);
                    peers[theirId].peerConnection = pc;

                    this.createClientMediaElements(theirId);

                    this.addClient(theirId, peers);

                }
            }
        });

        // when a new user has entered the server
        this.mySocket.on("newUserConnected", (theirId) => {
            if (theirId != this.mySocket.id && !(theirId in peers)) {
                console.log("A new user connected with the ID: " + theirId);

                console.log("Adding client with id " + theirId);
                peers[theirId] = {};

                this.createClientMediaElements(theirId);

                this.addClient(theirId, peers);
            }
        });

        this.mySocket.on("userDisconnected", (clientCount, _id, _ids) => {
            // Update the data from the server

            if (_id != this.mySocket.id) {
                console.log("A user disconnected with the id: " + _id);
                this.removeClient(_id, peers);
                this.removeClientElementAndCanvas(_id);
                delete peers[_id];
            }
        });

        this.mySocket.on("signal", (to, from, data) => {
            // console.log("Got a signal from the server: ", to, from, data);

            // to should be us
            if (to != this.mySocket.id) {
                console.log("Socket IDs don't match");
            }

            // Look for the right simplepeer in our array
            let peer = peers[from];
            if (peer.peerConnection) {
                peer.peerConnection.signal(data);
            } else {
                // console.log("Never found right simplepeer object");
                // Let's create it then, we won't be the "initiator"
                // let theirSocketId = from;
                let peerConnection = this.createPeerConnection(from, false);

                peers[from].peerConnection = peerConnection;

                // Tell the new simplepeer that signal
                peerConnection.signal(data);
            }
        });

        // Update when one of the users moves in space
        this.mySocket.on("positions", (_clientProps) => {
            this.updateClientPositions(_clientProps, this.mySocket, peers);
        });
    }
    createLocalVideoElement() {
        const usersCon = document.querySelector('#usersConnected');

        const videoElement = document.createElement("video");
        videoElement.id = "local_video";
        videoElement.autoplay = true;
        videoElement.style.marginRight = "20px"
        videoElement.style.marginLeft = "5px"
        videoElement.style.marginTop = "5px"

        videoElement.width = 10;
        videoElement.height = 10;
        videoElement.style = "position: static;";

        if (localMediaStream) {
            let videoStream = new MediaStream([localMediaStream.getVideoTracks()[0]]);

            videoElement.srcObject = videoStream;
        }
        usersCon.appendChild(videoElement);
    }

    createClientMediaElements(_id) {
        // console.log("Creating <html> media elements for client with ID: " + _id);
        const usersCon = document.querySelector('#usersConnected');

        // Create a div inside usersConnected that will contain the user video and audio element
        let userElement = document.createElement('div');
        userElement.setAttribute('id', _id);
        userElement.setAttribute('display', 'inline-block');

        // append video and audio elements to the div created above.

        const videoElement = document.createElement("video");
        videoElement.id = _id + "_video";
        videoElement.autoplay = true;
        videoElement.style = "position: static;";
        videoElement.style.marginRight = "20px"
        videoElement.style.marginLeft = "5px"
        videoElement.style.marginTop = "5px"
        videoElement.width = 10;
        videoElement.height = 10;

        userElement.appendChild(videoElement);
        

        // create audio element for client
        let audioEl = document.createElement("audio");
        audioEl.setAttribute("id", _id + "_audio");
        audioEl.controls = "controls";
        audioEl.volume = 1;
        audioEl.width = 10;
        audioEl.height = 10;
        audioEl.style = "position: static;";
        userElement.appendChild(audioEl);

        usersCon.appendChild(userElement);

        audioEl.addEventListener("loadeddata", () => {
            audioEl.play();
        });
    }

    updateClientMediaElements(_id, stream) {
        // this.reloadDIV();
        let videoStream = new MediaStream([stream.getVideoTracks()[0]]);
        let audioStream = new MediaStream([stream.getAudioTracks()[0]]);

        const videoElement = document.getElementById(_id + "_video");
        videoElement.srcObject = videoStream;

        let audioEl = document.getElementById(_id + "_audio");
        audioEl.srcObject = audioStream;
    }

    // remove <video> element and corresponding <canvas> using client ID
    removeClientElementAndCanvas(_id) {

        let userElement = document.getElementById(_id); //+ "_video"
        if (userElement != null) {
            userElement.remove();
        }
    }

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    // Clients 👫

    // add a client meshes, a video element and  canvas for three.js video texture
    addClient(id, peers) {
        let videoMaterial = makeVideoMaterial(id);
        let otherMat = new THREE.MeshNormalMaterial();

        let head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [otherMat, otherMat, otherMat, otherMat, otherMat, videoMaterial]);
        // set position of head before adding to parent object
        head.position.set(0, 0, 0);

        // https://threejs.org/docs/index.html#api/en/objects/Group
        var group = new THREE.Group();
        group.name = "Player"
        group.add(head);

        // add group to scene
        scene.add(group);
        console.log("before error: " + peers[id].group)
        peers[id].group = group;
        console.log("after error: " + peers[id].group)
        peers[id].previousPosition = new THREE.Vector3();
        peers[id].previousRotation = new THREE.Quaternion();
        peers[id].desiredPosition = new THREE.Vector3();
        peers[id].desiredRotation = new THREE.Quaternion();
    }

    removeClient(id, peers) {
        scene.remove(peers[id].group);
    }

    // overloaded function can deal with new info or not
    updateClientPositions(clientProperties, mySocket, peers) {
        this.lerpValue = 0;
        // console.log(clientProperties )

        for (let id in clientProperties) {
            if (id != mySocket.id) {
                peers[id].previousPosition.copy(peers[id].group.position);
                peers[id].previousRotation.copy(peers[id].group.quaternion);
                peers[id].desiredPosition = new THREE.Vector3().fromArray(
                    clientProperties[id].position
                );
                peers[id].desiredRotation = new THREE.Quaternion().fromArray(
                    clientProperties[id].rotation
                );
            }
        }
    }


    interpolatePositions(peers) {
        this.lerpValue += 0.1; // updates are sent roughly every 1/5 second == 10 frames
        for (let id in peers) {
            if (peers[id].group) {
                peers[id].group.position.lerpVectors(peers[id].previousPosition, peers[id].desiredPosition, this.lerpValue);
                peers[id].group.quaternion.slerpQuaternions(peers[id].previousRotation, peers[id].desiredRotation, this.lerpValue);
            }
        }
    }


    animate() {
        const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.
        // console.log(playerCollider.end)
        
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            controls(deltaTime);
            updatePlayer(deltaTime);
            updateSpheres(deltaTime);
            teleportPlayerIfOob(level);
            handleRaycaster.raycasterUpdate(camera)
        }

        frameCount++;

        if (frameCount % 25 === 0) {
            updateClientVolumes(peers);
            if(typeof createVideo != "undefined"){
                createVideo.updateVideoVolume(camera, mobileControls,  menuControl.muteButtonBoolean)
            }
        }
        // console.log("Before Enter mobilecontrols null")
        if(mobileControls == null){
            // console.log("Enter mobilecontrols null")
            mobileControls = new MobileControls();
        }

        if(mobileControls.detectAndroid()  || mobileControls.detectiOS()){
            mobileControls.controls.update();
            // console.log("mobileControls updated successfully")
        }

        requestAnimationFrame(() => this.animate());
        this.interpolatePositions(peers)

        renderer.render(scene, camera);

        if (mixer) {
            mixer.update(clock.getDelta()*2);
          }
          

    //    stats.update();

    }



}

function raycasterUpdate() {
    let origin = camera.position.clone()
    origin.set(origin.x, origin.y - 2.5, origin.z)

    raycaster.set(origin, new THREE.Vector3(0, -1, 0))

    var intersectionsDown = raycaster.intersectObjects(getCollidables())

    var onObject = intersectionsDown.length > 0 && intersectionsDown[0].distance < 0.25

}

function onDocumentMouseDown(event) {
    let onPointerDownPointerX = event.clientX
    let onPointerDownPointerY = event.clientY
    let onPointerDownLon = 180 
    let onPointerDownLat = 0
    let isUserInteracting = true
    var rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    handleRaycaster.intersectObjects(pointer, camera, scene)
}

function getCollidables() {
    return 0
}
function updateClientVolumes(peers) {
    for (let id in peers) {
        let audioEl = document.getElementById(id + "_audio");
        if (audioEl && peers[id].group) {
            let distSquared = camera.position.distanceToSquared(
                peers[id].group.position
            );
            if (distSquared <= 0) {
                distSquared = 1;
            }

            if (distSquared > 500) {
                audioEl.volume = 0;
            } else {
                // from lucasio here: https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
                let volume
                if (distSquared > 0){
                   volume = Math.min(1, 10 / distSquared);
                }
                else{
                    volume = 1;
                }
                audioEl.volume = volume;
            }
        }
    }
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    let width = window.innerWidth;
    let height = Math.floor(window.innerHeight * 0.85);
    renderer.setSize(width, height);

}

function throwBall() {

    const sphere = spheres[sphereIdx];

    camera.getWorldDirection(playerDirection);

    sphere.collider.center.copy(playerCollider.end).addScaledVector(playerDirection, playerCollider.radius * 1.5);

    // throw the ball with more force if we hold the button longer, and if we move forward

    const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));

    sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
    sphere.velocity.addScaledVector(playerVelocity, 2);

    sphereIdx = (sphereIdx + 1) % spheres.length;

}

function playerCollisions() {

    const result = worldOctree.capsuleIntersect(playerCollider);

    playerOnFloor = false;

    if (result) {

        playerOnFloor = result.normal.y > 0;

        if (!playerOnFloor) {

            playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

        }

        playerCollider.translate(result.normal.multiplyScalar(result.depth));

    }

}

function updatePlayer(deltaTime) {

    let damping = Math.exp(- 4 * deltaTime) - 1;

    if (!playerOnFloor) {

        playerVelocity.y -= GRAVITY * deltaTime;

        // small air resistance
        damping *= 0.1;

    }

    //console.log(camera.position)

    playerVelocity.addScaledVector(playerVelocity, damping);

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    playerCollisions();

    camera.position.copy(playerCollider.end);

}

function playerSphereCollision(sphere) {

    const center = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5);

    const sphere_center = sphere.collider.center;

    const r = playerCollider.radius + sphere.collider.radius;
    const r2 = r * r;

    // approximation: player = 3 spheres

    for (const point of [playerCollider.start, playerCollider.end, center]) {

        const d2 = point.distanceToSquared(sphere_center);

        if (d2 < r2) {

            const normal = vector1.subVectors(point, sphere_center).normalize();
            const v1 = vector2.copy(normal).multiplyScalar(normal.dot(playerVelocity));
            const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));

            playerVelocity.add(v2).sub(v1);
            sphere.velocity.add(v1).sub(v2);

            const d = (r - Math.sqrt(d2)) / 2;
            sphere_center.addScaledVector(normal, - d);

        }

    }

}

function spheresCollisions() {

    for (let i = 0, length = spheres.length; i < length; i++) {

        const s1 = spheres[i];

        for (let j = i + 1; j < length; j++) {

            const s2 = spheres[j];

            const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
            const r = s1.collider.radius + s2.collider.radius;
            const r2 = r * r;

            if (d2 < r2) {

                const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
                const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
                const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));

                s1.velocity.add(v2).sub(v1);
                s2.velocity.add(v1).sub(v2);

                const d = (r - Math.sqrt(d2)) / 2;

                s1.collider.center.addScaledVector(normal, d);
                s2.collider.center.addScaledVector(normal, - d);

            }

        }

    }

}

function updateSpheres(deltaTime) {

    spheres.forEach(sphere => {

        sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

        const result = worldOctree.sphereIntersect(sphere.collider);

        if (result) {

            sphere.velocity.addScaledVector(result.normal, - result.normal.dot(sphere.velocity) * 1.5);
            sphere.collider.center.add(result.normal.multiplyScalar(result.depth));

        } else {

            sphere.velocity.y -= GRAVITY * deltaTime;

        }

        const damping = Math.exp(- 1.5 * deltaTime) - 1;
        sphere.velocity.addScaledVector(sphere.velocity, damping);

        playerSphereCollision(sphere);

    });

    spheresCollisions();

    for (const sphere of spheres) {

        sphere.mesh.position.copy(sphere.collider.center);

    }

}

function getForwardVector() {

    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;

}

function getSideVector() {

    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;

}

function controls(deltaTime) {

    // gives a bit of air control
    const speedDelta = deltaTime * (playerOnFloor ? 15 : 8);

    //Event: verify if the niplpe is pressed
    // get nipple position from data without move event.
    //if the nipple position is different from the original position
    // then change the player position accordingly with the direction angle.
    // @TODO Refactory this to a function instead of using code directly
    if(document.getElementById('degree-data').innerText != '0'){
        let direction = document.getElementById('direction-angle').innerText
        // console.log(direction)
        if(direction == "right"){
            playerVelocity.add(getSideVector(camera).multiplyScalar(speedDelta));
        }
        //left
        else if(direction == "left"){
                playerVelocity.add(getSideVector(camera).multiplyScalar(-speedDelta));
            }
        else if(direction == "up"){
            playerVelocity.add(getForwardVector(camera).multiplyScalar(speedDelta));
        }
        else if(direction == "down"){
            playerVelocity.add(getForwardVector(camera).multiplyScalar(-speedDelta));
        }
    }


    if (keyStates['KeyW'] || keyStates['ArrowUp'] ) {

        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));

    }

    if (keyStates['KeyS'] || keyStates['ArrowDown'] ) {

        playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));

    }

    if (keyStates['KeyA'] || keyStates['ArrowLeft'] ) {

        playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));

    }

    if (keyStates['KeyD'] || keyStates['ArrowRight'] ) {

        playerVelocity.add(getSideVector().multiplyScalar(speedDelta));

    }


}

function loaderGLTF(loader, GLTFName, position, scale, collider) {

    loader.load(GLTFName, (gltf) => {

        gltf.scene.position.set(position.x, position.y, position.z)
        
        // console.log(gltf)
        gltf.scene.scale.set(scale, scale, scale); 

        scene.add(gltf.scene);
        console.log("world octree ")
        console.log(gltf.scene)
        if(collider){
            // we can create a new group getting only the childs we need to add the collider.
            // need to create an array with the selected gltf scene children

            for(let j=0; j < gltf.scene.children.length; j++){
                if(gltf.scene.children[j].name !=  "Puffs" && gltf.scene.children[j].name !=  "Cadeiras_Mesinhas" && gltf.scene.children[j].name !=  "Rack_Tv"){
                    // console.log("valor: " + j + " name: " + gltf.scene.children[j].name)
                    worldOctree.fromGraphNode(gltf.scene.children[j]);
                }
                if(gltf.scene.children[j].name == "Emissivos" || gltf.scene.children[j].name == "Plano_Buracos"){
                    gltf.scene.children[j].material.opacity = 0;
                    gltf.scene.children[j].material.transparent = true;
                }
            }
        }
        gltf.scene.traverse(child => {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material.map) {

                    child.material.map.anisotropy = 4;

                }

            }

        });

    });

}







function setPlayerPosition(level) {
    if (level == "gold") {
        playerCollider = new Capsule(new THREE.Vector3(goldPlayerPosition[0].x, goldPlayerPosition[0].y, goldPlayerPosition[0].z), new THREE.Vector3(goldPlayerPosition[1].x, goldPlayerPosition[1].y, goldPlayerPosition[1].z), 0.35);
        camera.rotation.set(goldPlayerRotation[0], goldPlayerRotation[1], goldPlayerRotation[2])

    }
    if (level == "diamond") {
        playerCollider = new Capsule(new THREE.Vector3(-5, 0.35, -9), new THREE.Vector3(-5, 1.5, -9), 0.35);
        camera.rotation.set(diamondPlayerRotation[0], diamondPlayerRotation[1], diamondPlayerRotation[2])
    }
    if (level == "silver") {
        playerCollider = new Capsule(new THREE.Vector3(40, 6, -10), new THREE.Vector3(40, 7, -10), 0.35);
        camera.rotation.set(silverPlayerRotation[0], silverPlayerRotation[1], silverPlayerRotation[2])
    }
}

function onStart(level) {

    createVideo = new CreateVideo(scene, level)
    console.log(createVideo)
    createVideo.loadVideo(mobileControls)



    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.domElement.addEventListener(
        'mousedown',
        (e) => {
            onDocumentMouseDown(e)
        },
        false
    )
    scene.background = new THREE.Color(0x88ccee);
    // scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

    // camera.rotation.set(0, -89.5, 0);
    camera.rotation.order = 'YXZ';



    // const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
    // fillLight1.position.set(2, 1, 1);
    // scene.add(fillLight1);
    // const pointLight = new THREE.PointLight(0xffffff, 1, 10)
    // pointLight.position.copy(camera.position)
    // scene.add(pointLight)
    const light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, -6);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = - 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = - 0.00006;
    scene.add(directionalLight);

    renderer.setPixelRatio(window.devicePixelRatio);
    let width = window.innerWidth;
    let height = Math.floor(window.innerHeight * 0.85);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);


    raycaster = new THREE.Raycaster()
    handleRaycaster = new HandleRaycaster(raycaster)
    



    // for (let i = 0; i < NUM_SPHERES; i++) {

    //     const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //     sphere.castShadow = true;
    //     sphere.receiveShadow = true;

    //     scene.add(sphere);

    //     spheres.push({
    //         mesh: sphere,
    //         collider: new THREE.Sphere(new THREE.Vector3(0, - 100, 0), SPHERE_RADIUS),
    //         velocity: new THREE.Vector3()
    //     });

    // }

    window.addEventListener('resize', onWindowResize);
    const helper = new OctreeHelper(worldOctree);
    helper.visible = false;

    const manager = new THREE.LoadingManager()
    const loadingBar = new LoadingBar()

    let a = 1
    manager.onProgress = (url, itemsLoad, itemsTotal) => {
        // console.log("Loading bar finished " + itemsTotal)
        loadingBar.progress(a / 31)
        a++
    }

    manager.onLoad = (url, itemsLoad, itemsTotal) => {
        // console.log("Loading bar finished " + itemsTotal)
        loadingBar.visible(false)
        let doc = document.getElementById("boxPermissionRequest")
        // console.log(doc)
        doc.style.display = "block";
    }


    const loader = new GLTFLoader(manager).setPath('./models/');
    console.log("LOADING GLTF")
    createScene(level, loader)

    let path = '/Avatar/novaanimaqualcommblend.glb'

    let characterThiago = new CharacterSpawn(path, scene, THREE, camera, raycaster, renderer)
    characterThiago.loadGLTF()

    var loaderSphere = new THREE.TextureLoader();
    loaderSphere.load('./files/sphere.jpg', function ( texture ) {
        
        var geometry = new THREE.SphereGeometry( 500, 500, 500 );
    
        var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.material.side = THREE.BackSide;
        mesh.scale.set(-1, 1, 1)
        mesh.rotation.set(0, 89, 0)
        scene.add( mesh );
    
    } );



}


function onStartControls(context){
    
    // mobileControls = new MobileControls();
    // console.log(context)
    // console.log("Before Enter mobilecontrols null 930")
    if(mobileControls == null){
        console.log("Enter mobilecontrols null 932")
        mobileControls = new MobileControls();
    }

    // console.log("detectMob: " + mobileControls.detectMob() + " " + mobileControls.iOS())
    if(mobileControls.detectAndroid() || mobileControls.detectiOS()){
        mobileControls.initDeviceMotionControls(camera);
    }
    else{
        console.log("Running on Desktop")
        document.addEventListener('keydown', (event) => {
            keyStates[event.code] = true;
        });

        document.addEventListener('keyup', (event) => {
            keyStates[event.code] = false;
        });

        container.addEventListener('mousedown', (event) => {
            // document.body.requestPointerLock();
            mouseTime = performance.now();
            isMouseDown = true;
        });

        document.addEventListener('mouseup', () => {
            // if (document.pointerLockElement !== null)
            isMouseDown = false;
            //throwBall();
        });

        document.body.addEventListener('mousemove', (event) => {
            if (isMouseDown) {
                camera.rotation.y -= event.movementX / 500;
                camera.rotation.x -= event.movementY / 500;
            }
        });
    }
} 


/**
 * Method to add box meshs on scene with an specific name
 * @method
 * 
*/
    
function addNewBoxMesh(x, y, z, scene, name){
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xfafafa,});
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(x, 0.5, z);
    boxMesh.name = name;
    scene.add(boxMesh);
  
  }


function createScene(level, loader) {
    // if (level === "silver") {
    //     loaderGLTF(loader, "Arcs.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "Ceiling.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "CenterStruct.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Carts.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Ceiling.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_CorridorRooms.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Entrance.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Floor.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Walls.001.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Walls.002.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR1_Windows.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Alcoves.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Carts.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Floor.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Railings.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Room.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Wall.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "FLOOR2_Windows.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "Misc.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "Puffs.glb", { x: 0, y: 0, z: 0 });
    //     loaderGLTF(loader, "Stairs.glb", { x: 0, y: 0, z: 0 });
    // }

    if (level == "gold") {
        let collider = true;
        // console.log("gold loader")
        loaderGLTF(loader, "Ouro/ouro.glb", { x: 10, y: 5, z: -10 }, 1, collider)
        collider = false;
        // loaderGLTF(loader, "Ouro/ouro2.glb", { x: 10, y: 5, z: -10 }, 1, collider)
        // loaderGLTF(loader, "Ouro/Ouro_01_V3_PARTE_03.glb", { x: 10, y: 5, z: -10 }, 1)
        // loaderGLTF(loader, "Ouro/Ouro_01_V3_PARTE_04.glb", { x: 10, y: 5, z: -10 }, 1)
        // loaderGLTF(loader, "Ouro/Ouro_01_V3_PARTE_05.glb", { x: 10, y: 5, z: -10 }, 1)
        // loaderGLTF(loader, "Ouro/Ouro_01_V3_PARTE_06.glb", { x: 10, y: 5, z: -10 }, 1)

        // loaderGLTF(loader, "gift.glb", { x: 4.6, y: -1.55, z: -7.55 },  0.001)
        // console.log(scene)
        // addImage('files/logos/logo_svg_w1.svg', { x: 29.7, y: 3.25, z: -8.75 }, { x: 0, y: 80.11, z: 0 })
    }

    // if (level === "diamond") {
        // loaderGLTF(loader, "Diamante/Diamante01.glb", { x: 10, y: 5, z: -10 })
        // loaderGLTF(loader, "Diamante/Diamante02.glb", { x: 10, y: 5, z: -10 })
        // loaderGLTF(loader, "Diamante/Diamante03.glb", { x: 10, y: 5, z: -10 })
        // loaderGLTF(loader, "Diamante/Diamante04.glb", { x: 10, y: 5, z: -10 })
    // }
}

function addImage(src, position, rotation) {
    let planeGeometry = new THREE.PlaneGeometry(9, 4)
    let texture = new THREE.TextureLoader().load(src)
    let planeMaterial = new THREE.MeshLambertMaterial({ map: texture, DoubleSide: true, transparent: true })

    var plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.set(position.x, position.y, position.z)
    plane.rotation.set(rotation.x, rotation.y, rotation.z)
    scene.add(plane)
}

function teleportPlayerIfOob(level) {


    if (camera.position.y <= - 5) {

        if (level === "silver") {
            playerCollider.start.set(silverPlayerPosition[0].x, silverPlayerPosition[0].y, silverPlayerPosition[0].z);
            playerCollider.end.set(silverPlayerPosition[1].x, silverPlayerPosition[1].y, silverPlayerPosition[1].z);
            playerCollider.radius = silverPlayerPosition[2];
            camera.position.copy(playerCollider.end);
            camera.rotation.set(silverPlayerRotation[0], silverPlayerRotation[1], silverPlayerRotation[2])
        }

        if (level === "gold") {
            playerCollider.start.set(goldPlayerPosition[0].x, goldPlayerPosition[0].y, goldPlayerPosition[0].z);
            playerCollider.end.set(goldPlayerPosition[1].x, goldPlayerPosition[1].y, goldPlayerPosition[1].z);
            playerCollider.radius = 0.35;
            camera.position.copy(playerCollider.end);
            camera.rotation.set(0, -89.5, 0);
            camera.rotation.set(goldPlayerRotation[0], goldPlayerRotation[1], goldPlayerRotation[2])
        }

        if (level === "diamond") {
            playerCollider.start.set(-5, 0.35, -9);
            playerCollider.end.set(-5, 1.5, -9);
            playerCollider.radius = 0.35;
            camera.position.copy(playerCollider.end);
            camera.rotation.set(diamondPlayerRotation[0], diamondPlayerRotation[1], diamondPlayerRotation[2])
        }


    }

}

let frameCount = 0;

function addGIF() {
    let path = './files/loadingONIVERSE_gif.gif'

    let gif = new SuperGif()
}

function getPlayerPosition() {
    return [
        [
            camera.position.x,
            camera.position.y,
            camera.position.z
        ],
        [
            camera.quaternion._x,
            camera.quaternion._y,
            camera.quaternion._z,
            camera.quaternion._w,
        ]
    ]
}

// Utilities



function makeVideoMaterial(id) {
    let videoElement = document.getElementById(id + "_video");
    let videoTexture = new THREE.VideoTexture(videoElement);

    let videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        overdraw: true,
        side: THREE.DoubleSide,
    });

    return videoMaterial;
}

// @TODO https://bitbucket.org/ft101021/m4c-world/src/master/public/js/scene.js Line 470
/*loadAnimatedAvatar(self){
      const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
      // We referenced the loader earlier; let’s create a new texture and material above this reference:
    let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
    
    stacy_txt.flipY = false; // we flip the texture so that its the right way up
    
    const stacy_mtl = new THREE.MeshPhongMaterial({
      map: stacy_txt,
      color: 0x9F7967,
      skinning: true
    }); */
export { Index }