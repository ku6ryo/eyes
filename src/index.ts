import {
  Scene,
  Engine,
  FreeCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
  InstancedMesh,
  Color4,
} from "babylonjs"
import eyeUrl from "./glb/eye_low.glb"
import "babylonjs-loaders"

const canvas = document.getElementById("canvas") as HTMLCanvasElement
const engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})

const createScene = function(){
  const scene = new Scene(engine)
  const camera = new FreeCamera("camera1", new Vector3(0, 0, -80), scene)
  camera.setTarget(Vector3.Zero())
  camera.attachControl(canvas, false)
  new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
  loadGlb(scene)
  return scene
}

const scene = createScene()
scene.clearColor = new Color4(0, 0, 0, 1)

const num = 10
const eyes: InstancedMesh[] = []

function createGridPose(length: number) {
  const poses: Pose[] = []
  Array(num * num).fill(null).forEach((_, i) => {
    const k = i % num
    const j = Math.round((i - k) / num)
    const x = length / (num - 1) * j - length / 2
    const y = length / (num - 1) * k - length / 2
    const z = 30
    const position = new Vector3(x, y, z) 
    const scale = new Vector3(1.5, 1.5, 1.5)
    const rotation = new Vector3(0, 0, 0)
    poses.push({
      position,
      scale,
      rotation,
    })
  })
  return poses
}

function createSphereDotPoses(radius: number) {
  const poses: Pose[] = []
  Array(num * num).fill(null).forEach((_, i) => {
    const k = i % num
    const j = Math.round((i - k) / num)
    const r = radius * Math.sin(Math.PI / (num + 1) * (j + 1))

    const x = r * Math.cos(2 * Math.PI  / num * k)
    const y = radius * Math.cos(Math.PI / (num + 1) * (j + 1))
    const z = r * Math.sin(2 * Math.PI  / num * k)
    const position = new Vector3(x, y, z) 
    const scale = new Vector3(1.5, 1.5, 1.5)
    const rotation = new Vector3(0, 0, 0)
    poses.push({
      position,
      scale,
      rotation,
    })
  })
  return poses
}

function createSphereDotPosesPhaseShift(radius: number) {
  const poses: Pose[] = []
  Array(num * num).fill(null).forEach((_, i) => {
    const k = i % num
    const j = Math.round((i - k) / num)
    const r = radius * Math.sin(Math.PI / (num + 1) * (j + 1))

    let horizontalPhase = 2 * Math.PI / num * k
    if (j % 2 === 0) {
      horizontalPhase += 2 * Math.PI / num
    }
    const x = r * Math.cos(horizontalPhase)
    const y = radius * Math.cos(Math.PI / (num + 1) * (j + 1))
    const z = r * Math.sin(horizontalPhase)
    const position = new Vector3(x, y, z) 
    const scale = new Vector3(1.5, 1.5, 1.5)
    const rotation = new Vector3(0, 0, 0)
    poses.push({
      position,
      scale,
      rotation,
    })
  })
  return poses
}

const transitions: Transition[] = [{
  start: createSphereDotPoses(30),
  end: createSphereDotPoses(50),
  duration: 40
}, {
  start: createSphereDotPoses(50),
  end: createSphereDotPoses(30),
  duration: 40
}, {
  start: createSphereDotPoses(30),
  end: createSphereDotPosesPhaseShift(30),
  duration: 40
}, {
  start: createSphereDotPosesPhaseShift(30),
  end: createGridPose(100),
  duration: 90
}, {
  start: createGridPose(100),
  end: createGridPose(100),
  duration: 90
}, {
  start: createGridPose(100),
  end: createSphereDotPosesPhaseShift(30),
  duration: 40
}]


let t = 0
let transitionIndex = 0
engine.runRenderLoop(function() {
    scene.render()
    const {
      start,
      end,
      duration
    } = transitions[transitionIndex]
    const passed = t / duration
    eyes.forEach((eye, i) => {
      const startPose = start[i]
      const endPose = end[i]
      eye.position = startPose.position.add(endPose.position.subtract(startPose.position).multiply(new Vector3(passed, passed, passed)))
      eye.scaling = startPose.scale.add(endPose.scale.subtract(startPose.scale).multiply(new Vector3(passed, passed, passed)))
    })
    if (t > duration) {
      t = 0
      if (transitionIndex === transitions.length - 1) {
        transitionIndex = 0
      } else {
        transitionIndex += 1
      }
    } else {
      t += 1
    }
})

type Transition = {
  start: Pose[],
  end: Pose[],
  duration: number
}

type Pose = {
  position: Vector3,
  scale: Vector3,
  rotation: Vector3,
}

async function loadGlb(scene: Scene) {
  const res = await SceneLoader.ImportMeshAsync(null, "", eyeUrl, scene)
  const mesh = res.meshes[0] as InstancedMesh
  const original = mesh.getChildMeshes()[0] as InstancedMesh
  original.setEnabled(false)
  for (let i = 0; i < num * num; i++) {
    const instance = original.createInstance("eye-" + i)
    instance.lookAt(new Vector3(0, 0, 0))
    eyes.push(instance)
  }
}

window.addEventListener("resize", function(){
  engine.resize()
})