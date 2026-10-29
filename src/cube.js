import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

export class Cube {

    id;
    mesh;
    faces = {
        x: undefined,
        y: undefined,
        z: undefined
    };

    constructor(scene, x, y, z) {
        const geometry = new BoxGeometry();

        const materials = [];

        for (const color of Cube.colors) {
            materials.push(new MeshBasicMaterial({color}));
        }
        this.mesh = new Mesh(geometry, materials);
        
        this.mesh.position.set(x, y, z);
        
        scene.add(this.mesh);

        this.id = this.mesh.uuid;
    }

    setFaceX(face) {
        this.faces.x = face;
        return face;
    }

    setFaceY(face) {
        this.faces.y = face;
        return face;
    }

    setFaceZ(face) {
        this.faces.z = face;
        return face;
    }
}

// right - left - top - bottom - front - back
Cube.colors = [
    0xffffff, // right -> white
    0xffff00, // left -> yellow
    0x008000, // top -> green
    0x0000ff, // bottom -> blue
    0xffa500, // front -> orange
    0xff0000, // back -> red
]