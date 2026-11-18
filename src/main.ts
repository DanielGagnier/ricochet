import './style.css'
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

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
camera.position.set(0, 1.7, 8)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
app.appendChild(renderer.domElement)

const controls = new PointerLockControls(camera, renderer.domElement)
const lookButton = document.createElement('button')
lookButton.className = 'look-prompt'
lookButton.textContent = 'Click to look around (Esc to release)'
app.appendChild(lookButton)

lookButton.addEventListener('click', () => controls.lock())
controls.addEventListener('lock', () => {
  lookButton.hidden = true
})
controls.addEventListener('unlock', () => {
  lookButton.hidden = false
})

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

function render() {
  renderer.render(scene, camera)
}

function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

controls.addEventListener('change', render)
window.addEventListener('resize', resizeRenderer)
render()
