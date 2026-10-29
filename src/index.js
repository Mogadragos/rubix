import { OrbitControls, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { Cube } from './cube';
import { Face } from './face';
//import { ActionList } from './action_list';

/* ----- Constants ----- */

const CONSTANTS = {
    AXIS: ['x', 'y', 'z'],
    DELTA: 1.01,
    RUBIX_SIZE: 3,
    HALF_RUBIX_SIZE: Math.floor(3/2),
}

/* ----- Globals ----- */

/*const action_list = new ActionList();*/

const cubes = {};

const faces = [];
const faces_axis = {
    x: undefined,
    y: undefined,
    z: undefined
};

const raycaster = new Raycaster();

const mouse = new Vector2();

let current_cube, rotating_face;

const mouse_detect = {
    prev_vector: new Vector3(),
    total_vector: new Vector3(),
    detect_num: 0,
};

let is_resized = false;

/* ----- Event Handlers ----- */

// Keydown Handlers
/*
const keydownHandler = (e) => {
    if(rotating_face) return;
    action_list.KeydownHandle(e);
}
*/
// Pointer Handlers

/**
 * Callback for pointer move
 * Get 10 mousemove and raycast to get mouse direction
 * Then, rotate the concerned face
 * @param {Event} e 
 * @returns 
 */
const detectPointerDirection = (e) => {
    if(mouse_detect.detect_num < 10) {
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, camera );
        const intersects = raycaster.intersectObjects( scene.children );
        if(intersects.length > 0) {
            const point = intersects[0].point;
            mouse_detect.total_vector.add(mouse_detect.prev_vector.sub(point));
            mouse_detect.prev_vector.set(point.x, point.y, point.z);
        }
        mouse_detect.detect_num++;

    } else {
        window.removeEventListener('pointermove', detectPointerDirection);
        const x = Math.round(Math.abs(mouse_detect.total_vector.x)*1000), y = Math.round(Math.abs(mouse_detect.total_vector.y)*1000), z = Math.round(Math.abs(mouse_detect.total_vector.z)*1000);
        const min = Math.min(x, y, z), max = Math.max(x, y, z);
        let coef;
        switch(min) {
            case x:
                for(const face of faces) {
                    if(face.type !== 'x' && face.is_rotating) return;
                }
                coef = Math.sign(current_cube.mesh.position.x);
                switch(max) {
                    case y: rotating_face = current_cube.faces.z.Rotate(-coef * mouse_detect.total_vector.y); break;
                    case z: rotating_face = current_cube.faces.y.Rotate(coef * mouse_detect.total_vector.z); break;
                }
            break;
            case y:
                for(const face of faces) {
                    if(face.type !== 'y' && face.is_rotating) return;
                }
                coef = Math.sign(current_cube.mesh.position.y);
                switch(max) {
                    case x: rotating_face = current_cube.faces.z.Rotate(coef * mouse_detect.total_vector.x); break;
                    case z: rotating_face = current_cube.faces.x.Rotate(-coef * mouse_detect.total_vector.z); break;
                }
            break;
            case z:
                for(const face of faces) {
                    if(face.type !== 'z' && face.is_rotating) return;
                }
                coef = Math.sign(current_cube.mesh.position.z);
                switch(max) {
                    case x: rotating_face = current_cube.faces.y.Rotate(-coef * mouse_detect.total_vector.x); break;
                    case y: rotating_face = current_cube.faces.x.Rotate(coef * mouse_detect.total_vector.y); break;
                }
            break;
        }
        return;
    }
}

/**
 * Callback for pointer down
 * Raycast to check if there is a cube
 * If yes, disable camera controls, get the cube and reset the mouse_detect object
 * @param {Event} e 
 * @returns 
 */
const onPointerDown = (e) => {
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children );
    if(intersects.length > 0) {
        e.stopImmediatePropagation();
        controls.enabled = false;
        if(rotating_face) return;
        const cube = cubes[intersects[0].object.uuid];
        if(cube) {
            current_cube = cube;
            const point = intersects[0].point;
            mouse_detect.prev_vector.set(point.x, point.y, point.z);
            mouse_detect.total_vector.set(0, 0, 0);
            mouse_detect.detect_num = 0;
            window.addEventListener('pointermove', detectPointerDirection, false);
        }
    }
}

/**
 * Callback for pointer up
 * Enable camera controls and remove pointer move handler
 * @param {Event} e 
 */
const onPointerUp = (e) => {
	controls.enabled = true;
    window.removeEventListener('pointermove', detectPointerDirection);
}

/* ----- Initialisation ----- */

// Set body style
document.documentElement.style.cssText = "margin: 0; height: 100%;";
document.body.style.cssText = "margin: 0; height: 100%;";

// Add WebGLRenderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.cssText = "width: 100%; height: 100%; display: block;";
document.body.appendChild(renderer.domElement);

// Add Shuffle button
const button = document.createElement('button');
button.style.cssText = "position: absolute; left: 50px; top: 20px;";
button.innerHTML = 'Shuffle !';
//button.addEventListener('click', Shuffle);
button.addEventListener('click', () => { location.reload() });
document.body.appendChild(button);

// Create scene
const scene = new Scene();

// Create camera and camera controls
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = CONSTANTS.RUBIX_SIZE;

// Init camera position
camera.position.set(CONSTANTS.RUBIX_SIZE, CONSTANTS.RUBIX_SIZE, CONSTANTS.RUBIX_SIZE * 2);
controls.update();

/* ----- Cubes generation -----*/

/**
 * Generate 3x3x3 cubes and every faces
 */
function GenerateCubes() {
    const min_coord = -CONSTANTS.DELTA * CONSTANTS.HALF_RUBIX_SIZE;
    const max_coord = CONSTANTS.DELTA * (CONSTANTS.HALF_RUBIX_SIZE + 1);

    const faces_x = [], faces_y = [], faces_z = [];
    
    let index_x = 0;
    for(let x = min_coord; x < max_coord; x += CONSTANTS.DELTA) {
        let index_y = 0;
        const face_x = new Face('x');
        faces_x.push(face_x); faces.push(face_x);
        scene.add(face_x);
        for(let y = min_coord; y < max_coord; y+= CONSTANTS.DELTA) {
            let index_z = 0;
            const face_y = new Face('y');
            faces_y.push(face_y); faces.push(face_y);
            scene.add(face_y);
            for(let z = min_coord; z < max_coord; z+= CONSTANTS.DELTA) {
                const face_z = new Face('z');
                faces_z.push(face_z); faces.push(face_z);
                scene.add(face_z);
                const cube = new Cube(scene, x, y, z);
                cube.setFaceX(faces_x[index_x]).AddCube(cube);
                cube.setFaceY(faces_y[index_y]).AddCube(cube);
                cube.setFaceZ(faces_z[index_z]).AddCube(cube);
                cubes[cube.id] = cube;
                index_z++;
            }
            index_y++;
        }
        index_x++;
    }

    faces_axis.x = faces_x;
    faces_axis.y = faces_y;
    faces_axis.z = faces_z;
}

GenerateCubes();

/**
 * Update faces cubes depends on their positions
 */
function UpdateFaces() {
    for(const face of faces) {
        face.cubes = [];
    }

    let cube;
    for(const cube_id in cubes) {
        cube = cubes[cube_id];
        cube.setFaceX(faces_axis.x[cube.mesh.position.x / CONSTANTS.DELTA + CONSTANTS.HALF_RUBIX_SIZE]).AddCube(cube);
        cube.setFaceY(faces_axis.y[cube.mesh.position.y / CONSTANTS.DELTA + CONSTANTS.HALF_RUBIX_SIZE]).AddCube(cube);
        cube.setFaceZ(faces_axis.z[cube.mesh.position.z / CONSTANTS.DELTA + CONSTANTS.HALF_RUBIX_SIZE]).AddCube(cube);
    }
}

/**
 * Shuffle the Rubix
 */
function Shuffle() {
    for(let i = 0; i < 40 + Math.floor(Math.random() * 11); i++) {
        faces_axis[CONSTANTS.AXIS[Math.floor(Math.random() * 3)]][Math.floor(Math.random() * CONSTANTS.RUBIX_SIZE)].InstantRotate(Math.random() - 0.5);
        UpdateFaces();
    }
}

Shuffle();

/* ----- Animation loop ----- */

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    return width / height;
}

/**
 * Animation loop
 */
const animate = function () {
    requestAnimationFrame( animate );

    if(rotating_face) if(rotating_face.KeepRotating(/*action_list*/)) {
        rotating_face.Disable();
        UpdateFaces();
        rotating_face = null;
    }

    if (is_resized) {
        camera.aspect = resizeRendererToDisplaySize(renderer);
        camera.updateProjectionMatrix();
        is_resized = false;
    }

    renderer.render( scene, camera );
};

window.addEventListener('pointerdown', onPointerDown, false);
window.addEventListener('pointerup', onPointerUp, false);
window.addEventListener('resize', () => {
    if(!is_resized) is_resized = true;
}, false);
//window.addEventListener('keydown', keydownHandler, false);

animate();