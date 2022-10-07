import './tailwind.css'
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import VertexShader from './shaders/vertex.glsl'
import FragmentShader from './shaders/fragment.glsl'
import AtmVertexShader from './shaders/atmVertex.glsl'
import AtmFragmentShader from './shaders/atmFragment.glsl'
import { Float32BufferAttribute, PointLightHelper, ZeroSlopeEnding } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas')
const canvasContainer = document.querySelector('#canvasContainer')

// Scene
const scene = new THREE.Scene()

/**
 * TEarth
 */
// Geometry
const geometry = new THREE.SphereBufferGeometry( 6, 50, 50)

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    uniforms: {
        globeTexture: {
            value: new THREE.TextureLoader().load('/night.jpg')
        }
    }
})

// const material_map = new THREE.MeshBasicMaterial({
//     map: new THREE.TextureLoader().load('/sea.jpg')
// })

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//ATMOSPHERE
const atmosphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(6.1, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: AtmVertexShader,
        fragmentShader: AtmFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)
atmosphere.scale.set(1.1, 1.1, 1.1)
scene.add(atmosphere)

const group = new THREE.Group()
group.add(mesh)
scene.add(group)

//stars

const starGeom = new THREE.BufferGeometry()
const starMat = new THREE.PointsMaterial({color: 0xffffff,
    size: Math.random() * 0.011,
    sizeAttenuation: true,
    opacity: 0.4, 
    transparent: true}
)
const starVert = []
for(let i = 0; i < 600; i++){
    const x = (Math.random() - 0.5) * 75
    const y = (Math.random() - 0.5) * 75
    const z = - Math.random() * 200
    starVert.push( x, y, z)
}
starGeom.setAttribute('position', new Float32BufferAttribute(starVert, 3))

const stars = new THREE.Points(starGeom, starMat)
stars.scale.set(0.51, 0.51, 0.51)
scene.add(stars)

//point
function createPoint({lat, lng, country, capital}) {

    const box = new THREE.Mesh(
        new THREE.BoxBufferGeometry(0.15, 0.15, 0.4),
        new THREE.MeshBasicMaterial({color: 0xff4d00, opacity: 0.4, transparent: true})
    )

    
    const latitude = (lat/ 180) * Math.PI
    const longitude = ( lng / 180) * Math.PI
    const radius = 6

    const x = radius * Math.cos(latitude) * Math.sin(longitude)
    const y = radius * Math.sin(latitude)
    const z = radius * Math.cos(latitude) * Math.cos(longitude)

    box.position.x = x
    box.position.y = y
    box.position.z = z

    box.lookAt(0, 0, 0)
    box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.2))

    group.add(box)

    gsap.to(box.scale, {
        z: 1.4,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'linear',
        delay: Math.random() * 5
    })
    // box.scale.z = 

    box.country = country
    box.capital = capital
}
createPoint({lat:23.6345,lng: - 102.5528, country: 'Mexico', capital: "Mexico City"}) // 23.6345° N 102.5528° W - mexico
createPoint({lat:36.204823,lng: 138.252930, country: 'Japan', capital: "Tokyo"}) //Japan
createPoint({lat: - 19.0154,lng: 29.1549, country:'Zimbabwe', capital: "Harare"}) //Zimbabwe
createPoint({lat:- 14.235,lng: -51.9253, country:'Brazil', capital: "Brasília"})//brazil
createPoint({lat:41.8919,lng: 12.5113, country:'Italy', capital: "Rome"}) //Italy
createPoint({lat: 20.5937,lng: 78.9629, country:'India', capital: "New Delhi "})//India
createPoint({lat:-25.2744,lng:  133.7751, country:'Australia', capital: "Canberra"})//australia
createPoint({lat: 37.0902,lng: - 95.7129, country:'United States', capital: "Washington, D.C."})//United States
createPoint({lat: 71.7069,lng: - 42.6043, country:'Greenland', capital: "Nuuk"})//Greenland
createPoint({lat: 55.3781,lng: 3.436, country:'United Kingdom', capital: "London"})//United Kingdom





mesh.rotation.y = - Math.PI / 2
group.rotation.offset = {
    y: 0,
    x: 0
}


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



/**
 * Camera
 */
// Base camera
let camera = new THREE.PerspectiveCamera(75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 100)
camera.position.set(0, 0, 20)
scene.add(camera)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
    camera = new THREE.PerspectiveCamera(75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 100)
    camera.position.z = 20
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

//RAycaster
const raycaster = new THREE.Raycaster()
const popUp = document.querySelector('#popUp')
const countryName = document.querySelector('#country')
const capitalName = document.querySelector('#capital')

const mouse = {
    x: undefined,
    y: undefined,
    down: false,
    xPrev: undefined,
    yPrev: undefined
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const tick = () =>
{   
    group.rotation.y += 0.0005

    // if(mouse.x){
    // gsap.to(group.rotation, {
    //     x: - mouse.y * 0.8,
    //     y: mouse.x * 0.8,
    //     duration: 1.8
    // })}

  

    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( group.children.filter(mesh  => {
        return mesh.geometry.type === "BoxBufferGeometry"
    }) );


    group.children.forEach((mesh) => {
        mesh.material.opacity = 0.4
    })

    gsap.set(popUp, {
        display: "none"
    })

	for ( let i = 0; i < intersects.length; i ++ ) {
       const box =  intersects[i].object
       box.material.opacity = 1
        gsap.set(popUp, {
            display: "block"
        })	
        countryName.innerHTML = box.country
        capitalName.innerHTML = box.capital

	}

	

    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

canvasContainer.addEventListener('mousedown', ({clientX, clientY}) =>{
    mouse.down = true
    mouse.xPrev = clientX
    mouse.yPrev = clientY
})

addEventListener('mousemove', (event) => {

    if(innerWidth >= 1280){
        mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1
        mouse.y = - (event.clientY / innerHeight) * 2 + 1
    } else {
        const offset = canvasContainer.getBoundingClientRect().top
        mouse.x = (event.clientX /innerWidth ) * 2 - 1
        mouse.y = - ((event.clientY - offset )/ innerHeight) * 2 + 1
    }
    
   

    gsap.set(popUp, {
        x: event.clientX,
        y: event.clientY
    })

    if (mouse.down){
        event.preventDefault()
        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev

        group.rotation.offset.x += deltaY * 0.005
        group.rotation.offset.y += deltaX * 0.005

        gsap.to(group.rotation, {
            y: group.rotation.offset.y,
            x: group.rotation.offset.x,
            duration: 2
        })
       
        mouse.xPrev = event.clientX
        mouse.yPrev = event.clientY

    }
})

//Mobile

addEventListener('mouseup', () => {
    mouse.down = false
})

addEventListener('touchmove', (event) => {
    event.clientX = event.touches[0].clientX
    event.clientY = event.touches[0].clientY


    const doesIntersect = raycaster.intersectObject(mesh)
    if(doesIntersect.length > 0)   mouse.down = true
    
    if (mouse.down){

    const offset = canvasContainer.getBoundingClientRect().top
    mouse.x = (event.clientX /innerWidth ) * 2 - 1
    mouse.y = - ((event.clientY - offset )/ innerHeight) * 2 + 1
    

    gsap.set(popUp, {
        x: event.clientX,
        y: event.clientY
    })

    
        event.preventDefault()
        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev

        group.rotation.offset.x += deltaY * 0.005
        group.rotation.offset.y += deltaX * 0.005

        gsap.to(group.rotation, {
            y: group.rotation.offset.y,
            x: group.rotation.offset.x,
            duration: 2
        })
       
        mouse.xPrev = event.clientX
        mouse.yPrev = event.clientY

    }
}, {passive: false})

addEventListener('touchend', () => {
    mouse.down = false
})