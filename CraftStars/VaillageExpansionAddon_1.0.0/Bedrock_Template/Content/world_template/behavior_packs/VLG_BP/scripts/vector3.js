export class Vector3 {
    /**
     * @remarks Create a new Vector3.
     * @param value The value to crate a new Vector3. Either a single value used for x, y and z. Or an object with an x, y and z value.
     */
    constructor(value) {
        if (typeof value === 'object' && value !== null) {
            this.x = value.x;
            this.y = value.y;
            this.z = value.z;
        }
        else {
            this.x = value;
            this.y = value;
            this.z = value;
        }
    }
	
	
    add(value) {
        if (typeof value === 'object' && value !== null) {
            return new Vector3({ x: this.x + value.x, y: this.y + value.y, z: this.z + value.z });
        }
        else {
            return new Vector3({ x: this.x + value, y: this.y + value, z: this.z + value });
        }
    }
    subtract(value) {
        if (typeof value === 'object' && value !== null) {
            return new Vector3({ x: this.x - value.x, y: this.y - value.y, z: this.z - value.z });
        }
        else {
            return new Vector3({ x: this.x - value, y: this.y - value, z: this.z - value });
        }
    }
    multiply(value) {
        if (typeof value === 'object' && value !== null) {
            return new Vector3({ x: this.x * value.x, y: this.y * value.y, z: this.z * value.z });
        }
        else {
            return new Vector3({ x: this.x * value, y: this.y * value, z: this.z * value });
        }
    }
	
	equals(value) {
		return (value !== undefined && this.x == value.x && this.y == value.y && this.z == value.z);
	}
	equals_xz(value) {
		return (this.x == value.x && this.z == value.z);
	}
	
	toCommand() {
		return `${this.x.toFixed(2)} ${this.y.toFixed(2)} ${this.z.toFixed(2)}`;
	}
	toLocation() {
		return { x: this.x, y: this.y, z: this.z };
	}
	
}

export function distance(a, b) {
    return Math.sqrt(distanceSquared(a,b));
}

export function length(vector) {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}
export function unit(originalVector) {
    const originalVectorLength = length(originalVector);
    return new Vector3({
        x: originalVector.x / originalVectorLength,
        y: originalVector.y / originalVectorLength,
        z: originalVector.z / originalVectorLength
    });
}

// Prefer using distance squared over distance to avoid calculating square root
// Consider using 'distanceSquared(a,b) < targetDistance * targetDistance' when making 'in range' checks
export function distanceSquared(a, b) {
    const difference = (new Vector3(a)).subtract(b);
    return difference.x * difference.x + difference.y * difference.y + difference.z * difference.z;
}

export function cross(a, b) {
    // a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1
    const c = new Vector3({
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    });
    return c;
}

export function copy(value)
{
	return new Vector3(value)
}
export function copyFloor(value)
{
	return new Vector3({x: Math.floor(value.x), y: Math.floor(value.y), z: Math.floor(value.z)});
}
export function copyCenter(value)
{
	return new Vector3({x: Math.floor(value.x)+0.5, y: Math.floor(value.y), z: Math.floor(value.z)+0.5});
}

// dim - what dimensions to check - x, xz, xyz, etc
export function locationIsInArea(location, corner1, corner2, dim)
{
	if (dim.includes("x") && !numIsInRange(location.x, corner1.x, corner2.x))
		return false;
	if (dim.includes("y") && !numIsInRange(location.y, corner1.y, corner2.y))
		return false;
	if (dim.includes("z") && !numIsInRange(location.z, corner1.z, corner2.z))
		return false;
	return true;
}

export function numIsInRange(num, edge1, edge2)
{
	if (edge1 <= num && num <= edge2) 
		return true;
	if (edge2 <= num && num <= edge1)
		return true;
	return false;
}

export function fromRotation(rotation )
{
	let rotationH = rotation.y * -1;
	let z0 = Math.cos(rotationH *Math.PI/180);
	let x0 = Math.sin(rotationH *Math.PI/180);
	
	let rotationV = rotation.x * -1;
	if (rotationV > 15)
		rotationV = 15;
	if (rotationV < -15)
		rotationV = -15;
	let h = Math.cos(rotationV *Math.PI/180);
	let v = Math.sin(rotationV*Math.PI/180);
	
	return new Vector3({x: h*x0, y:v, z:h*z0});
}

export function getLocationOnCircle(center, startPoint, height, percent) {
    // Calculate radius from center to start point
    const radius = Math.sqrt(
        Math.pow(startPoint.x - center.x, 2) + 
        Math.pow(startPoint.z - center.z, 2)
    );

    // Calculate the starting angle based on the startpoint and center
    const startAngle = Math.atan2(startPoint.z - center.z, startPoint.x - center.x);
    
    // Calculate the current angle by adding the progress to the starting angle
    const angle = startAngle + (percent * 2 * Math.PI);
    
    // Calculate x and z coordinates on the circle
    const x = center.x + radius * Math.cos(angle);
    const z = center.z + radius * Math.sin(angle);

    // Calculate y coordinate (linear interpolation between startPoint.y and startPoint.y + height)
    const y = startPoint.y + (height * percent);

    return (new Vector3({ x: x, y: y, z: z }));
}
export function getLocationOnRiseBackwards(startPoint, centerPoint, height, additionalDistance, progress) {
    // Calculate the direction vector from center to start
    const direction = {
        x: startPoint.x - centerPoint.x,
        z: startPoint.z - centerPoint.z
    };
    
    // Calculate the distance between center and start
    const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    
    // Normalize the direction vector
    const normalizedDirection = {
        x: direction.x / distance,
        z: direction.z / distance
    };
    
    // Calculate the end point
    const endPoint = {
        x: startPoint.x + normalizedDirection.x * additionalDistance,
        y: startPoint.y + height,
        z: startPoint.z + normalizedDirection.z * additionalDistance
    };
    
    // Calculate the current point based on progress
    const currentPoint = {
        x: startPoint.x + (endPoint.x - startPoint.x) * progress,
        y: startPoint.y + (endPoint.y - startPoint.y) * progress,
        z: startPoint.z + (endPoint.z - startPoint.z) * progress
    };
    
    return currentPoint;
}
export function getLocationOnRise(startPoint, distance, percent) {
    startPoint.y = startPoint.y + distance * percent;
    return (new Vector3(startPoint));
}
export function getLocationOnDescent(endPoint, distance, percent) {
    endPoint.y = endPoint.y + distance * (1-percent);
    return (new Vector3(endPoint));
}
export function getLocationOnMovement(startPoint, endPoint, percent) {
    
    // Calculate the end point
    const currentPoint = {
        x: startPoint.x + percent * (endPoint.x -startPoint.x),
        y: startPoint.y + percent * (endPoint.y -startPoint.y),
        z: startPoint.z + percent * (endPoint.z -startPoint.z)
    };
    return (new Vector3(currentPoint));
}
export function getEndpointOnRiseBackwards(startPoint, centerPoint, height, additionalDistance) {
    // Calculate the direction vector from center to start
    const direction = {
        x: startPoint.x - centerPoint.x,
        z: startPoint.z - centerPoint.z
    };
    
    // Calculate the distance between center and start
    const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    
    // Normalize the direction vector
    const normalizedDirection = {
        x: direction.x / distance,
        z: direction.z / distance
    };
    
    // Calculate the end point
    const endPoint = {
        x: startPoint.x + normalizedDirection.x * additionalDistance,
        y: startPoint.y + height,
        z: startPoint.z + normalizedDirection.z * additionalDistance
    };
    
    return endPoint;
}
export function getViewedLocationForEntity(entity, distance) {
    return getViewedLocation(entity.location, entity.getViewDirection(), distance);
}
export function getViewedLocation(location, viewDirection, distance) {
    viewDirection.y = 0;
    viewDirection = unit(viewDirection);

    // Calculate the new location based on the view direction and distance
    const newLocation = {
        x: location.x + viewDirection.x * distance,
        y: location.y,
        z: location.z + viewDirection.z * distance
    };
    
    return copy(newLocation);
}

export function vectorToRotation(vector) {    
    // Calculate the angle using the arctangent function
    const angle = Math.atan2(vector.x, vector.z);
    
    // Convert the angle from radians to degrees if needed
    const angleInDegrees = angle * (180 / Math.PI);

    return angleInDegrees;
}
export function rotationToFacing(rotation)
{
	let rot = rotation.y;
	if (rot < 0)
		rot += 360;
	
	if (rot < 45) return "south";
	if (rot < 135) return "west";
	if (rot < 225) return "north"; 
	if (rot < 315) return "east";
	return "south";
	// 0 south 90 west 180 north 270 east
}
export function rotationToFacing8(rotation)
{
	let rot = rotation.y;
	if (rot < 0)
		rot += 360;
	
    if (rot < 22.5) return "south";
    if (rot < 67.5) return "southwest";
    if (rot < 112.5) return "west";
    if (rot < 157.5) return "northwest";
    if (rot < 202.5) return "north";
    if (rot < 247.5) return "northeast";
    if (rot < 292.5) return "east";
    if (rot < 337.5) return "southeast";
    return "south";
	// 0 south 90 west 180 north 270 east
}

export function rotationToFixedRotation(rotation)
{
	let rot = rotation.y;
	if (rot < 0)
		rot += 360;
	
	if (rot < 45) return 0;
	if (rot < 135) return 90;
	if (rot < 225) return 180; 
	if (rot < 315) return 270;
	return 0;
	// 0 south 90 west 180 north 270 east
}

export function areaToSelector(corner1, corner2) 
{
    //return "x=" + corner1.x + ",y=" + corner1.y + ",z=" + corner1.z + ",dx=" + (corner2.x - corner1.x) + ",dy=" + (corner2.y - corner1.y) + ",dz=" + (corner2.z - corner1.z);
    return "x=" + corner1.x + ",y=" + -64 + ",z=" + corner1.z + ",dx=" + (corner2.x - corner1.x) + ",dy=" + 384 + ",dz=" + (corner2.z - corner1.z);
    //return "x=" + corner1.x + ",z=" + corner1.z + ",dx=" + (corner2.x - corner1.x) + ",dz=" + (corner2.z - corner1.z);
}

export const Down = new Vector3({ x: 0, y: -1, z: 0 });
export const Down2 = new Vector3({ x: 0, y: -2, z: 0 });
export const Up = new Vector3({ x: 0, y: 1, z: 0 });
export const Up2 = new Vector3({ x: 0, y: 2, z: 0 });
export const North = new Vector3({ x: 0, y: 0, z: -1 });
export const South = new Vector3({ x: 0, y: 0, z: 1 });
export const West = new Vector3({ x: -1, y: 0, z: 0 });
export const East = new Vector3({ x: 1, y: 0, z: 0 });
export const NW = new Vector3({ x: -1, y: 0, z: -1 });
export const SE = new Vector3({ x: 1, y: 0, z: 1 });

export function areLocationsInRangeXZ(loc1, loc2, range) {
    let dx = Math.abs(loc1.x - loc2.x);
    let dz = Math.abs(loc1.z - loc2.z);
    return dx <= range && dz <= range;
}

export function areaCenterToFillCoords(location, workArea, yOffset) {
    let corner1 = { x: location.x - Math.floor((workArea.x-1)/2), y: location.y + yOffset, z: location.z- Math.floor((workArea.z-1)/2) };
    let corner2 = { x: corner1.x + workArea.x - 1, y: corner1.y + workArea.y - 1, z: corner1.z + workArea.z - 1 };
    // Returns a command to fill an area with a block type
    return `${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z}`;
}
export function areaCenterToCoords(location, workArea, yOffset) {
    let corner1 = { x: location.x - Math.floor((workArea.x-1)/2), y: location.y + yOffset, z: location.z- Math.floor((workArea.z-1)/2) };
    let corner2 = { x: corner1.x + workArea.x - 1, y: corner1.y + workArea.y - 1, z: corner1.z + workArea.z - 1 };
    // Returns a command to fill an area with a block type
    return [ corner1, corner2 ];
}


