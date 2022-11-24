import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';

let mixer;

class CharacterSpawn {
    constructor(path, scene, THREE, camera, raycaster, renderer) {
        this.path = path
        this.scene = scene
        this.THREE = THREE
        this.camera = camera
        this.raycaster = raycaster
        this.renderer = renderer
        this.clock = new this.THREE.Clock()
        this.init()
    }

    async init() {
        // let character = this.THREE.TextureLoader().load(this.path)
        // const gltf = new this.loadGLTF(this.path)
        // this.avatar = gltf.scene.children[0]
        // this.avatar.position.set(0, 1, 0)
        // this.scene.add(this.avatar)
    }

    loadGLTF() {
        const loader = new GLTFLoader().setPath('../files')
        loader.load(this.path, (gltf) => {
 
        this.model = gltf.scene.children[0]

        let fileAnimations = gltf.animations
        // console.log(fileAnimations)
        // this.model.scale.set(0.0088, 0.0088, 0.0088); 
        this.model.traverse(child => {
            if(child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

            }

            });
            
            // We’re going to create a new AnimationMixer, an AnimationMixer is a player for animations on a particular object in the scene.
            mixer = new THREE.AnimationMixer(this.model);

            // We’re going to create a new AnimationClip, we’re looking inside our fileAnimations to find an animation called ‘idle’. This name was set inside Blender.
            // let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'Armature|mixamo.com|Layer0');
            let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'Armature|mixamo.com|Layer0.001');
            
            
        //   idleAnim.tracks.splice(3, 3);
        //   idleAnim.tracks.splice(9, 3);
            
            // We then use a method in our mixer called clipAction, and pass in our idleAnim. We call this clipAction idle.
            
            // Finally, we tell idle to play:
            let idle = mixer.clipAction(idleAnim);
            idle.play();

            this.model.position.set(3, -2.542, -7)
            this.model.rotation.set(7.9, 0, -4.5)
            this.scene.add(this.model)
        })
    }

    loadFBX() {
        const loader = new FBXLoader()

        loader.load(this.path, (fbx) => {
            this.model = fbx
            let fileAnimations = fbx.animations

            this.model.position.set(10, -2.5, 0)
            this.model.rotation.set(0, 10, 0)
            console.log(this.model)
        })
    }
}

export {mixer, CharacterSpawn}