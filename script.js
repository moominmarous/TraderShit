const COLORS = Object.freeze(['#7B93AB', '#73B7FF', '#A09A44', '#496643', '#AFBEB7']);
const ELEMENTS = Object.freeze(['ᨒ', '𖦹', '෴', '𖣂', '░']);
const PATHS = Object.freeze([
    [-1, 4, -1, 4, 4, 4, -1, 4, -1],
    [-1, 4, -1, -1, 4, 4, -1, 4, -1],
    [-1, 4, -1, -1, 4, -1, -1, 4, -1],
    [-1, -1, -1, -1, 4, -1, -1, 4, -1],
    [-1, -1, -1, -1, 4, 4, -1, 4, -1],
    [-1, -1, -1, -1, -1, 4, -1, -1, -1],
])
let VISIBLE = false;
const DIMENSIONS = {};
const zoomrange = Array.from({ length: 20 }, (_, i) => parseFloat((0.1 * (i + 1)).toFixed(1)));
let zoomIndex = 9
const UNITWIDTH = 20
const STATS = new Array(4);

let isDragging = false;
// let offsetX, offsetY;

const coordPoint = (x = 0, y = 0) => {
    return { x: x, y: y }
}

let start = coordPoint();
let offset = coordPoint();


const drawMap = (map, container) => {
    for (let i = 0; i < map.length; i++) {
        let element = map[i];
        let nine = document.createElement('div')
        nine.className = 'pathSpace';
        for (let j = 0; j < 9; j++) {
            let unit = document.createElement('div');
            unit.className = "cellUnit"
            unit.style.backgroundColor = COLORS[element];
            unit.innerText = ELEMENTS[element];
            nine.appendChild(unit);
        }
        container.appendChild(nine);
    }
}


/**
 * This is the main function
 * @param {*} flag determines whether dimensions are as selected or randomized.
 */
const generateMap = (width, height) => {
    //make map
    let map = new Array(width * height);
    for (let i = 0; i < map.length; i++) {
        let val = Math.floor(Math.random() * 4); // Assign random values to each element
        map[i] = val;
        // console.log(`${val} => ${STATS[val]}`)
    }
    console.log('');
    let container = document.getElementById('map-space');
    container.innerHTML = ''; //clear
    // container.style.gridTemplateColumns = `repeat(${DIMENSIONS.map_w}, 1fr)`;
    // container.style.gridTemplateRows = `repeat(${DIMENSIONS.map_h}, 1fr)`;
    container.style.width = `${UNITWIDTH * DIMENSIONS.map_w}px`;
    container.style.height = `${UNITWIDTH * DIMENSIONS.map_h}px`;
    drawMap(map, container);
    moveMap(container);
};

const moveMap = (container) => {
    // let point = document.getElementById('point');

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';

        // // Update the red dot position (fixed at the mouse press location)
        // point.style.left = `${e.clientX - 2.5}px`;
        // point.style.top = `${e.clientY - 2.5}px`;

        const parentRect = container.parentNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        offset.x = e.clientX - (containerRect.left - parentRect.left);
        offset.y = e.clientY - (containerRect.top - parentRect.top);
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // // Update the red dot position
        // point.style.left = `${e.clientX - 2.5}px`;
        // point.style.top = `${e.clientY - 2.5}px`;

        // Move the container based on mouse movement
        container.style.position = 'absolute';
        container.style.left = `${e.clientX - offset.x}px`;
        container.style.top = `${e.clientY - offset.y}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
};

const generateTiles = () => {
    let container = document.getElementById('placeUs');
    for (let i = 0; i < 5; i++) {
        let tile = document.createElement('div');
        tile.className = 'pathSpace';
        let pathNumber = Math.floor(Math.random() * 5);
        for (let j = 0; j < 9; j++) {
            let unit = document.createElement('div');
            unit.className = 'cellUnit';
            if (PATHS[pathNumber][j] != -1) {
                unit.innerHTML = ELEMENTS[4];
                unit.style.backgroundColor = COLORS[4]
            } else {
                unit.style.backgroundColor = 'transparent'
            }
            tile.appendChild(unit);
        }
        container.appendChild(tile);
    }
}

const movePoint = () => {
    let container = document.getElementById('map-space');
    const point = document.getElementById('point');
    let pointisDragging = false;
    const clickNDrag = (container) => {
        container.addEventListener("mousedown", (e) => {
            pointisDragging = true;
            // Update the red dot position (fixed at the mouse press location)
            point.style.left = `${e.clientX - 2.5}px`;
            point.style.top = `${e.clientY - 2.5}px`;
            console.log(isDragging)
        });

        document.addEventListener("mousemove", (e) => {
            if (!pointisDragging) return;
            // Update the red dot position
            point.style.left = `${e.clientX - 2.5}px`;
            point.style.top = `${e.clientY - 2.5}px`;
        });

        document.addEventListener("mouseup", () => {
            pointisDragging = false;
        });
    }
}

window.onload = () => {
    VISIBLE = false;
    generateMap(31, 15);
    generateTiles();
    movePoint()
    console.log("generated");
};