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

let health = 3
const healthDisplay = document.createElement('div')
healthDisplay.className = 'health-display'
healthDisplay.setAttribute('role', 'status')
healthDisplay.textContent = `Health: ${health}`
app.appendChild(healthDisplay)

const gameOverDisplay = document.createElement('div')
gameOverDisplay.className = 'game-over'
gameOverDisplay.textContent = 'Game over'
gameOverDisplay.hidden = true
app.appendChild(gameOverDisplay)

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

interface TargetState {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  direction: number
}

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff5722 })

function createTarget(): TargetState {
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  mesh.position.set(Math.random() * 8 - 4, 1.7, -3 - Math.random() * 6)
  scene.add(mesh)

  return {
    mesh,
    direction: Math.random() < 0.5 ? -1 : 1,
  }
}

const targets: TargetState[] = []
const maxTargets = 5
const spawnIntervalMilliseconds = 2000
const forwardSpeed = 1
const dangerLineZ = 6

function spawnTarget() {
  targets.push(createTarget())
}

spawnTarget()

let previousTimestamp = performance.now()
let lastSpawnTimestamp = previousTimestamp
const horizontalSpeed = 2
let gameOver = false

function animate(timestamp: number) {
  const deltaSeconds = (timestamp - previousTimestamp) / 1000
  previousTimestamp = timestamp

  if (
    !gameOver &&
    targets.length < maxTargets &&
    timestamp - lastSpawnTimestamp >= spawnIntervalMilliseconds
  ) {
    spawnTarget()
    lastSpawnTimestamp = timestamp
  }

  for (let index = targets.length - 1; index >= 0; index--) {
    const target = targets[index]

    target.mesh.position.x += target.direction * horizontalSpeed * deltaSeconds
    target.mesh.position.z = Math.min(
      target.mesh.position.z + forwardSpeed * deltaSeconds,
      dangerLineZ,
    )

    if (target.mesh.position.z >= dangerLineZ) {
      scene.remove(target.mesh)
      targets.splice(index, 1)
      health -= 1
      healthDisplay.textContent = `Health: ${health}`

      if (health === 0) {
        gameOver = true
        gameOverDisplay.hidden = false
        break
      }

      continue
    }

    if (target.mesh.position.x <= -4) {
      target.mesh.position.x = -4
      target.direction = 1
    } else if (target.mesh.position.x >= 4) {
      target.mesh.position.x = 4
      target.direction = -1
    }
  }

  render()
  if (!gameOver) {
    requestAnimationFrame(animate)
  }
}

requestAnimationFrame(animate)


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
