import { Group, Vector3 } from "three";

export class Face extends Group {
    type;
    cubes = [];
    axis;
    direction = 0;
    initial_rotation;
    final_rotation;
    nb_steps;
    step_index;
    step_val;

    constructor(type) {
        super();
        this.type = type;
        switch(type) {
            case 'x':
                this.axis = new Vector3(1, 0, 0);
            break;
            case 'y':
                this.axis = new Vector3(0, 1, 0);
            break;
            case 'z':
                this.axis = new Vector3(0, 0, 1);
            break;
        }
        this.nb_steps = 20;
        this.step_val = Math.PI/2 / this.nb_steps;
    }

    AddCube(cube) {
        this.cubes.push(cube);
    }

    Enable() {
        for(const cube of this.cubes) {
            this.add(cube.mesh);
        }
    }

    Disable() {
        for(const cube of this.cubes) {
            const world_pos = new Vector3();
            cube.mesh.getWorldPosition(world_pos);
            cube.mesh.position.set(Math.round(world_pos.x * 100) / 100, Math.round(world_pos.y * 100) / 100, Math.round(world_pos.z * 100) / 100,)
            cube.mesh.getWorldQuaternion(cube.mesh.quaternion);
            cube.mesh.parent = null;
        }
        this.quaternion.identity();
    }

    Rotate(dir) {
        if(this.is_rotating) return;
        
        this.Enable();
        this.direction = Math.sign(dir);
        this.is_rotating = true;

        this.initial_rotation = this.rotation[this.type];
        this.final_rotation = this.initial_rotation + this.direction * Math.PI/2;
        
        this.step_index = 0;
        
        return this;
    }

    InstantRotate(dir) {
        this.Enable();
        this.rotation[this.type] += Math.sign(dir) * Math.PI/2;
        this.Disable();
    }

    KeepRotating(/*action_list*/) {
        this.rotateOnAxis(this.axis, this.direction * this.step_val);

        const condition = !(this.step_index < this.nb_steps);
        
        if(condition) {
            this.rotation[this.type] = this.final_rotation;
            this.is_rotating = false;

            /*
            action_list.Add({
                do: (data) => {
                    data.face.InstantRotate(data.direction);
                },
                undo: (data) => {
                    data.face.InstantRotate(-data.direction);
                },
                data: {
                    face: this,
                    direction: this.direction,
                }
            })
            */
        }

        this.step_index++;

        return condition;
    }
}