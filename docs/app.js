import * as THREE from './libs/three/three.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';

class App{
    constructor() {
        const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.set( 0, 0.5, 5);
        this.camera.lookAt(0,0,0)
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( Math.random()*0xffffff );
        
		this.ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 4);
		this.scene.add(this.ambient);
        

        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );
        
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set(0,4,10)
        this.scene.add( directionalLight );

        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
        this.sphereCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget );
        this.sphereCamera.position.set(0, 100, 0);
        this.scene.add(this.sphereCamera);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer : true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        container.appendChild( this.renderer.domElement );
		
        
        this.init();
        this.render()
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        // this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    onKeyDown(e){
        const left = 37,right = 39, up = 38, down = 40, enter = 13;
        if(e.keyCode == left) app.camera.position.x -= 4;
        else if(e.keyCode == right) app.camera.position.x += 4;
        else if(e.keyCode == up) {
            app.camera.position.y += 4;
        }
        else if(e.keyCode == down) {
            app.camera.position.y -= 4;
        }
        else if(e.keyCode == enter) {
            app.camera.position.z -= 5;
        }
        


    }
    loadBackground = () => {
        // Load the images used in the background.
        var path = "assets/cubemap/"+ Math.floor(Math.random()*40+1)+"/";
        var format = ".jpeg";
    
        let urls = [
            path + 'posx.jpg',path + 'negx.jpg',
            path +'posy.jpg', path +'negy.jpg',
            path +'posz.jpg', path +'negz.jpg',
          ];
        var reflectionCube = new THREE.CubeTextureLoader().load(urls);
        reflectionCube.format = THREE.RGBFormat;
        this.scene.background = reflectionCube;
    }
    
    randomInRange = (from, to) => {
        let x  = Math.random()* (to-from);
        return x+from;
    }

    createSpheres() {

        
        // let sphereMaterial = new THREE.MeshBasicMaterial( {envMap: this.sphereCamera.renderTarget} );
        // const self= this;
        for(let i = 0; i<=400; i++) {

            let size = this.randomInRange(10,80);
            let color = Math.random() * 0xffffff
            // let positionX = Math.random()*100 - 20;
            // let positionY = Math.random()*100 -20;
            // let positionZ = -Math.random()*100 -10;
            let positionX = this.randomInRange(-1000,1000);
            let positionY = this.randomInRange(-1000,1000);
            let positionZ = this.randomInRange(-1000,1000);


            const geometry = new THREE.SphereGeometry(size,80,80);
            const material = new THREE.MeshPhongMaterial(
                {
                    color:color,
                    transparent:true, 
                    side: THREE.BackSide,
                    shininess:80,
                    envMap: this.sphereCamera.renderTarget,
                    opacity: 0.5});
            // const material = new THREE.MeshStandardMaterial(
            //     {
            //         color:color,
            //         roughness:0,
            //         transparent:true, 
            //         side:  THREE.DoubleSide,
            //         envMap: this.sphereCamera.renderTarget,
            //     opacity: 0.8
            //     }
            // )
            const sphere = new THREE.Mesh(geometry,material);
            sphere.position.set(positionX, positionY, positionZ)
            this.scene.add(sphere)
            
        }
    }
    saveAsImage() {
        var imgData, imgNode;
        var strDownloadMime = "image/octet-stream";
        try {
            var strMime = "image/jpeg";
            imgData = window.app.renderer.domElement.toDataURL(strMime);

            app.saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");

        } catch (e) {
            console.log(e);
            return;
        }

    }

    saveFile (strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            location.replace(uri);
        }
    }

    init() {
        this.createSpheres();
        this.loadBackground();
        var saveLink = document.createElement('div');
        saveLink.style.position = 'absolute';
        saveLink.style.top = '10px';
        saveLink.style.width = '100%';
        saveLink.style.color = 'white !important';
        saveLink.style.textAlign = 'center';
        saveLink.innerHTML =
            '<a href="#" id="saveLink">Save Frame</a>';
        document.body.appendChild(saveLink);
        document.getElementById("saveLink").addEventListener('click', this.saveAsImage);
        document.addEventListener("keydown", this.onKeyDown, false);
    }

    render() {
        this.sphereCamera.updateCubeMap( this.renderer, this.scene );
        requestAnimationFrame(this.render.bind(this));       
        this.renderer.render(this.scene, this.camera)
    }
}

export {App};