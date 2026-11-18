import './style.css'
import * as THREE from 'three'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Could not find the #app element')
}

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x101820)

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
)
camera.position.set(0, 8, 12)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
app.appendChild(renderer.domElement)

scene.add(new THREE.AmbientLight(0xffffff, 1.5))

const sunlight = new THREE.DirectionalLight(0xffffff, 2)
sunlight.position.set(5, 10, 5)
scene.add(sunlight)

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 1 }),
)
floor.rotation.x = -Math.PI / 2
scene.add(floor)

const grid = new THREE.GridHelper(20, 20, 0x82939f, 0x455a64)
grid.position.y = 0.01
scene.add(grid)

function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.render(scene, camera)
}

window.addEventListener('resize', resizeRenderer)
renderer.render(scene, camera)
