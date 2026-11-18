import * as THREE from 'three'

type TargetMesh = THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>

interface TargetState {
  mesh: TargetMesh
  direction: number
}

const maxTargets = 5
const spawnIntervalMilliseconds = 2000
const horizontalSpeed = 2
const forwardSpeed = 1
const dangerLineZ = 6

export class TargetManager {
  private readonly scene: THREE.Scene
  private readonly targets: TargetState[] = []
  private readonly sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
  private readonly sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5722,
  })
  private lastSpawnTimestamp = performance.now()

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.spawnTarget()
  }

  getMeshes(): TargetMesh[] {
    return this.targets.map((target) => target.mesh)
  }

  removeTarget(mesh: THREE.Object3D): boolean {
    const targetIndex = this.targets.findIndex((target) => target.mesh === mesh)

    if (targetIndex === -1) {
      return false
    }

    this.scene.remove(mesh)
    this.targets.splice(targetIndex, 1)
    return true
  }

  update(deltaSeconds: number, timestamp: number): number {
    if (
      this.targets.length < maxTargets &&
      timestamp - this.lastSpawnTimestamp >= spawnIntervalMilliseconds
    ) {
      this.spawnTarget()
      this.lastSpawnTimestamp = timestamp
    }

    let targetsReachedPlayer = 0

    for (let index = this.targets.length - 1; index >= 0; index--) {
      const target = this.targets[index]

      target.mesh.position.x += target.direction * horizontalSpeed * deltaSeconds
      target.mesh.position.z = Math.min(
        target.mesh.position.z + forwardSpeed * deltaSeconds,
        dangerLineZ,
      )

      if (target.mesh.position.z >= dangerLineZ) {
        this.removeTarget(target.mesh)
        targetsReachedPlayer += 1
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

    return targetsReachedPlayer
  }

  private spawnTarget(): void {
    const mesh = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial)
    mesh.position.set(Math.random() * 8 - 4, 1.7, -3 - Math.random() * 6)
    this.scene.add(mesh)

    this.targets.push({
      mesh,
      direction: Math.random() < 0.5 ? -1 : 1,
    })
  }
}
