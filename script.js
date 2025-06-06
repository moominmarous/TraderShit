const CARDCLASS = Object.freeze(['green', 'yellow', 'red']);
const CARDINFO = Object.freeze({
    green: { color: '#BEBC4D', type: 'boon', pay: 'pay' },
    yellow: { color: '#E3BC7B', type: 'friend', pay: 'hire' },
    red: { color: '#BE4D4D', type: 'foe', pay: 'bribe' }
});
const COLORS = Object.freeze(['#7B93AB', '#73B7FF', '#A09A44', '#496643', 'burlywood']);
const TEXTCOLOR = Object.freeze(['black', '#4e4cff', 'black', 'black', 'black']);
const ELEMENTS = Object.freeze(['M', 'O', 'w', 'T', '•']);
// const ELEMENTS = Object.freeze(['ᨒ', '𖦹', '෴', '𖣂', '☐']);
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
let map;
let placed;
let RESOURCESTATS; //key is ELEMENTS[i]
let SELECTEDSTATS; //key is ELEMENTS[i]
let CLASSNAMES = ['mountains', 'whirlpool', 'meadow', 'forest']

let isDragging = false;
// let offsetX, offsetY;

const coordPoint = (x = 0, y = 0) => {
    return { x: x, y: y }
}

let start = coordPoint();
let offset = coordPoint();


const drawMap = (map, container) => {

    for (let i = 0; i < map.length; i += 9) {
        let nine = document.createElement('div')
        nine.className = 'pathSpace';
        for (let j = 0; j < 9; j++) {
            let element = map[i + j];
            let unit = document.createElement('div');
            unit.className = "cellUnit"
            unit.style.backgroundColor = COLORS[element];
            unit.style.color = TEXTCOLOR[element];
            unit.innerText = ELEMENTS[element];
            nine.appendChild(unit);
        }
        // nine.addEventListener('click',tileInteraction)
        nine.addEventListener('click', placeTileHere);
        container.appendChild(nine);
    }
    //position container:
    //position map in center:
    let p = container.parentNode.getBoundingClientRect();
    let c = container.getBoundingClientRect();
    console.log(`parent:${p.width},${p.height}`);
    console.log(`map: ${c.width},${c.height}`);
    let x = (p.width - c.width) / 2
    let y = (p.height - c.height) / 2
    if (c.width > p.width) {
        x = -(c.width - p.width) / 2
    }
    if (c.height > p.height) {
        y = -(c.height - p.height) / 2
    }
    console.log(`calculated position ${x},${y}`);
    container.position = 'absolute'
    container.style.top = `${y}px`
    container.style.left = `${x}px`
}


/**
 * This is the main function to genrate the map
 * @param {*} flag determines whether dimensions are as selected or randomized.
 */
const generateMap = (width, height) => {
    //make map structure on backend
    map = new Array(width * height * 9);
    for (let i = 0; i < map.length; i++) {
        map[i] = Math.floor(Math.random() * 4);
    }
    let container = document.getElementById('map-space');
    container.innerHTML = ''; //clear
    container.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    //draw the map div and all its contents
    drawMap(map, container);
    //add move functionality to map
    moveMap(container);
    // saveButton(map);
    // saveMapToFile(map);
};

const saveButton = (map) => {
    let saveButton = document.createElement('button');
    saveButton.innerText = 'Save Map';
    saveButton.onclick = () => saveMapToFile(map);
    document.body.appendChild(saveButton);
}

const moveMap = (container) => {

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';

        const parentRect = container.parentNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        offset.x = e.clientX - (containerRect.left - parentRect.left);
        offset.y = e.clientY - (containerRect.top - parentRect.top);
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        container.style.position = 'absolute';
        container.style.left = `${e.clientX - offset.x}px`;
        container.style.top = `${e.clientY - offset.y}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
}

const generateRandomPathTiles = () => {
    let container = document.getElementById('placeUs');
    for (let i = 0; i < 5; i++) {
        let tile = document.createElement('div');
        tile.className = 'pathSpace';
        let pathID = Math.floor(Math.random() * 5);
        for (let j = 0; j < 9; j++) {
            let unit = document.createElement('div');
            unit.className = 'cellUnit';
            if (PATHS[pathID][j] != -1) {
                unit.innerHTML = ELEMENTS[4];
                unit.style.backgroundColor = COLORS[4]
                unit.style.color = TEXTCOLOR[4]
            } else {
                unit.style.backgroundColor = 'transparent'
            }
            tile.appendChild(unit);
        }
        tile.addEventListener('click', selectTileToPlace);
        container.appendChild(tile);
    }
}

let selectedTile;
let destinationTile;
// PLACE ME TILES
const selectTileToPlace = (e) => {
    if ((selectedTile != undefined || (selectedTile == e.target.parentNode))) {
        selectedTile.style.opacity = '100%'
        selectedTile.classList.remove('shadow');
        selectedTile = undefined;
    } else {
        selectedTile = e.target.parentNode;
        selectedTile.classList.add('shadow');
    }
}

// select & deselect tile
const tileInteraction = (e) => {
    console.log('interacting with tile...')
    let tile = undefined;
    //is this necessary?
    if (e.target.classList.contains('cellUnit')) {
        tile = e.target.parent;
    } else if (e.target.classList.contains('pathSpace')) {
        tile = e.target;
    }
    //check if selected prior: 
    if (tile.style.transform == 'scale(1.2)') {
        tile.classList.remove('shadow')
        tile.style.transform = 'scale(1)'
        tile.style.zIndex = '0';
    } else {
        tile.classList.add('shadow')
        tile.style.transform = 'scale(1.2)'
        tile.style.zIndex = '2';
    }
    return tile; //this does not get returned
}


// MAP DESTINATIONS
const placeTileHere = (e) => {
    console.log('placeTileHere starts')
    // console.assert(destinationTile == undefined)
    if (destinationTile != undefined && destinationTile.classList.contains('placed')) return
    if (destinationTile == e.target.parentNode) {
        //this is pressing the same exact tile
        destinationTile.classList.remove('shadow')
        destinationTile.style.transform = 'scale(1)'
        destinationTile.style.zIndex = '0';
        destinationTile = undefined;
        return;
    }
    if ((destinationTile != undefined)) {
        destinationTile.classList.remove('shadow')
        destinationTile.style.transform = 'scale(1)'
        destinationTile.style.zIndex = '0';
        destinationTile = undefined;
    }
    if (e.target.id == 'map-space') return;
    destinationTile = e.target;
    if (e.target.className == 'cellUnit') destinationTile = e.target.parentNode;
    //figured out what the destination tile is.

    // console.log(`destination tile: ${destinationTile.className}`);
    if (selectedTile == undefined && destinationTile.classList.contains('placed')) {
        destinationTile.classList.add('shadow')
        destinationTile.style.transform = 'scale(1.2)'
        destinationTile.style.zIndex = '2';
        return;
    }
    if (selectedTile != undefined && destinationTile.classList.contains('placed')) {
        console.log('there is a path here already!')
        destinationTile = undefined;
        return
    }
    //place:
    let destinationUnits = Array.from(destinationTile.children);
    if (selectedTile != undefined) {
        let sourceUnits = Array.from(selectedTile.children);
        for (let i = 0; i < 9; i++) {
            if (sourceUnits[i].innerHTML == ELEMENTS[4]) {
                destinationUnits[i].innerHTML = sourceUnits[i].innerHTML;
                destinationUnits[i].style.backgroundColor = sourceUnits[i].style.backgroundColor;
                destinationUnits[i].style.color = sourceUnits[i].style.color;
            } else {
                //resources not covered by path
                let key = destinationUnits[i].innerHTML;
                if (ELEMENTS.includes(key)) {
                    // console.log('this is a correct key')
                    // console.log(`resource key found: ${key}`)
                    if (RESOURCESTATS.has(key)) {
                        // console.log(`updating value of ${parseFloat(RESOURCESTATS.get(key))}`)
                        RESOURCESTATS.set(key, parseFloat(RESOURCESTATS.get(key)) + 1)
                    } else {
                        RESOURCESTATS.set(key, 1)
                    }
                }
            }
        }
        selectedParent = selectedTile.parentNode;
        selectedParent.removeChild(selectedTile);
        selectedTile = undefined;
        if (!destinationTile.classList.contains('placed')) {
            destinationTile.classList += ' placed'
        }
        updateResourceCount();
        //place complete
        if (selectedParent.children.length == 0) {
            console.log('all tiles gone!')
            generateNewVisitor();
        }
    }
    destinationTile = undefined;
}

const setupPlayerInfo = () => {
    let container = document.getElementsByClassName('playerInfo')[0];
    container.innerHTML = ' <div>MERCHANT SKOROBOGATOV</div>';
    container.appendChild((createLabeledStat('TOTAL RESOURCES', 'info-resources')))
    container.appendChild((createLabeledStat('MOUNTAINS ᨒ', ELEMENTS[0], COLORS[0])))
    container.appendChild((createLabeledStat('WATER BODIES 𖦹', ELEMENTS[1], COLORS[1])))
    container.appendChild((createLabeledStat('MEADOWS ෴', ELEMENTS[2], COLORS[2])))
    container.appendChild((createLabeledStat('FORESTS 𖣂', ELEMENTS[3], COLORS[3])))
    container.appendChild((createLabeledStat('PATH TILES ☐', ELEMENTS[4], COLORS[4])))
}

const createLabeledStat = (labeltext, id, color) => {
    let label = document.createElement('div')
    label.style.backgroundColor = color;
    label.innerText = labeltext + ' ';
    let stat = document.createElement('input');
    stat.disabled = true;
    stat.value = 0;
    stat.id = id;
    label.appendChild(stat);
    return label;
}

const updateResourceCount = () => {
    let total = 0;
    for (const [key, value] of RESOURCESTATS.entries()) {
        // console.log(`Key: ${key}, Value: ${value}`);
        let input = document.getElementById(key);
        input.value = value;
        total += value;
    }
    document.getElementById('info-resources').value = total;
    document.getElementById(ELEMENTS[4]).value = document.getElementsByClassName('placed').length;
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

const moveVisitorsToQueue = () => {
    let visitorContainer = document.getElementById('visitorsContainer');
    let newVisitor = document.getElementById('currentVisitor');
    // let visitorSection = newVisitor.parentNode;
    visitorContainer.append(newVisitor);
    visitorContainer.style.display = 'block';
}

const generateNewVisitor = () => {
    let visitorContainer = document.getElementById('visitorSection');
    let newVisitor = generateRandomCard(Math.floor(Math.random() * 3))
    newVisitor.className += " centered";
    newVisitor.id = 'currentVisitor';
    visitorContainer.append(newVisitor);
}

const generateCards = () => {
    let visitors = document.getElementsByClassName('visitorsContainer')[0].children;
    Array.from(visitors).forEach((card) => {
        console.log(card);
        card.addEventListener("click", (e) => mirrorCard(e))
    })
    console.log(visitors)

}

const saveMapToFile = (map) => {

    // Convert the map array to a JSON string
    const jsonString = JSON.stringify(map, null, 2); // Pretty-print with 2 spaces

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map.json'; // Name of the file to save
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
    console.log('saved map')
};

const gameLoop = () => {
    let nextDayButton = document.getElementById('nextDayButton');
    nextDayButton.addEventListener('click', generateNextDay);
    while (document.getElementById('placeUs').children.length < 5) {
        generateRandomPathTiles();
        if (document.getElementById('placeUs').children.length == 0) {
            console.log(`generating new visitor...`)
            let visitorContainer = document.getElementsByClassName('visitorsContainer')[0];
            visitorContainer.appendChild(generateRandomCard(Math.floor(Math.random() * 3)));
        }
    }
    //console.log(document.getElementById('placeUs').children.length);
}

const generateNextDay = () => {
    generateRandomPathTiles();
    if (document.getElementById('placeUs').children.length == 0) {
        console.log(`generating new visitor...`)
        let visitorContainer = document.getElementsByClassName('visitorsContainer')[0];
        visitorContainer.appendChild(generateRandomCard(Math.floor(Math.random() * 3)));
    }
}

const generateRandomCard = (cardType) => {
    let card = document.createElement('div');
    cardType = CARDCLASS[cardType];
    card.className = `card ${cardType}`;
    card.style.backgroundColor = CARDINFO[cardType].color;

    let h = document.createElement('h4');
    h.innerHTML = CARDINFO[cardType].type;
    card.appendChild(h);

    let hearts = Math.floor(Math.random() * 4) + 1;
    let p = document.createElement('p');
    p.innerHTML = `${hearts}♡:${hearts}⚔︎:${(hearts / 2).toFixed(1)}⛊`;
    card.append(p);

    let price = document.createElement('div')
    price.className = 'myTiles'
    let remainingPrice = 6;
    for (let i = 0; i < 4; i++) {
        let d = document.createElement('div')
        d.className = CLASSNAMES[i];
        d.padding = '5px'
        // d.style.padding = '0';
        let v = Math.floor(Math.random() * remainingPrice)
        remainingPrice -= v;
        d.innerHTML = v;
        price.appendChild(d)
    }
    card.append(price)

    // let cost = Math.floor(Math.random() * 4) + 1;
    // p = document.createElement('p');
    // p.innerHTML = `${cost}${ELEMENTS[Math.floor(Math.random() * 4)]} `;
    // p.className = `cardCost`
    // card.append(p);

    card.addEventListener('click', (e) => mirrorCard(e))

    return card;
};

// Show card in interact spot
const mirrorCard = (e) => {
    let card = e.target;
    if (card.parentNode.classList.contains('card')) {
        card = card.parentNode
    }
    CLASSNAMES.forEach(name => {
        if (e.target.classList.contains(name)) {
            card = e.target.parentNode.parentNode;
        }
    })
    if (e.target.classList.contains('myTiles')) {
        card = e.target.parentNode;
    }
    let selected = document.getElementById('selectedCard');
    selected.innerHTML = card.innerHTML;
    selected.className = card.className;
    console.log(`${card.classList}`)
    // selected.style.backgroundColor = card.style.backgroundColor;
    let description = document.getElementById('selectedDescription');
    let paragraph = card.querySelector('p'); // Select the first <p> element
    description.innerText = paragraph ? paragraph.innerText : "No description available";

    showBuyOptions(card.classList[1]);
    let buyButton = document.getElementById('transactionAction');
    buyButton.disabled = false;
    console.log(`buyButton.disabled = ${buyButton.disabled}`)
    buyButton.addEventListener('click', (e) => transaction(e, card))

    document.getElementById('confirmAction').addEventListener('click', (e) => confirmTransaction(e, card))


    let ignoreButton = document.getElementById('ignoreAction');
    ignoreButton.disabled = false;
    ignoreButton.addEventListener('click', () => ignoreCard(card))
}

const ignoreCard = (card) => {
    console.log('ignoring....')
    let visitors = document.getElementsByClassName('visitorsContainer')[0]
    visitors.appendChild(card)
    visitors.classList.remove('hidden')
    cleanupMirror()
}

let selectedTiles = new Set();
const transaction = (e, card) => {
    console.log('transaction....')
    console.log(`${card}`)
    showBuyResourceManager();
    let transactionAction = document.getElementById('transactionAction')
    transactionAction.classList.add('hidden');
    let confirmButton = document.getElementById('confirmAction');
    confirmButton.classList.remove('hidden');


    //get placed path tiles:
    let placedTiles = document.querySelectorAll('.placed')

    // let cost = getCardCost(card);


    placedTiles.forEach((tile) => {
        tile.removeEventListener('click', placeTileHere);
        tile.addEventListener('click', selectResourcesForTransaction)
        console.log('added new event listener')
    });

    // let handContainer = document.getElementsByClassName('handCardsContainer')[0]
    // handContainer.appendChild(card)
    // cleanupMirror()
    // SELECTEDSTATS = new Map()
    // updatePayWithContainer()
}

const confirmTransaction = (e, card) => {
    console.log('calculating...')
    //get the cost of the card:
    let alert = document.getElementById('confirmAlert')
    let costContainer = card.querySelector('.myTiles');
    for (let i = 0; i < 4; i++) {
        let element = costContainer.querySelector('.' + CLASSNAMES[i]);
        let value = element.innerText;
        if (parseInt(value) < SELECTEDSTATS[i]) {
            alert.classList.remove('hidden')
            alert.innerText = 'You did not select enough resources'
            return;
        }
    }
    //remove selectedTiles:
    selectedTiles.forEach((tile) => {
        //each tile has children
        Array.from(tile.children).forEach((cellUnit) => {
            let key = cellUnit.innerHTML;
            RESOURCESTATS.set(key, parseFloat(RESOURCESTATS.get(key)) - 1)
            let newVal = Math.floor(Math.random() * 4)
            cellUnit.innerText = ELEMENTS[newVal];
            cellUnit.style.backgroundColor = COLORS[newVal];
            cellUnit.style.color = TEXTCOLOR[newVal];
        })
        tile.classList.remove('placed');
        tile.style.border = '1px solid black';
        tile.style.transform = 'scale(1)'
    })
    selectedTiles = [];

    alert.classList.add('hidden')
    //then move card to hand!
    if (card.classList.contains('green') || card.classList.contains('yellow')) {
        let handContainer = document.getElementsByClassName('handCardsContainer')[0]
        handContainer.appendChild(card)
    } else {
        //red card goes to all visitors:
        let visitors = document.getElementsByClassName('visitorsContainer')[0]
        visitors.appendChild(card)
        visitors.classList.remove('hidden')
        cleanupMirror()
        return;
    }
    Array.from(handContainer.childNodes).forEach((card) => {
        card.removeEventListener('click', selectResourcesForTransaction);
        // card.addEventListener('click', )
    })
    updateResourceCount()
    cleanupMirror();
}
let selectedResourceTiles = 0;

const selectResourcesForTransaction = (e) => {
    let path;
    if (e.target.parentNode.classList.contains('placed')) {
        path = e.target.parentNode;
    } else if (e.target.classList.contains('placed')) {
        path = e.target;
    }
    if (selectedTiles.has(path)) {
        selectedTiles.delete(path)
        path.style.border = '1px solid black';
        selectedResourceTiles -= 1;
    } else {
        selectedTiles.add(path)
        path.style.border = '1px solid red';
        selectedResourceTiles += 1;
    }
    SELECTEDSTATS = new Map()
    //update resource info
    if (selectedTiles == undefined) return
    selectedTiles.forEach((tile) => {
        Array.from(tile.children).forEach((unitCell) => {
            //unitCell.innerText = ELEMENTS[0,1,2,3]
            let key = unitCell.innerText
            if (SELECTEDSTATS.has(key)) {
                SELECTEDSTATS.set(key, SELECTEDSTATS.get(key) + 1);
            } else {
                SELECTEDSTATS.set(key, 1);
            }
        })
    })
    updatePayWithContainer()
    //
}

const updatePayWithContainer = () => {
    let payWithContainer = document.getElementById('payWith')
    payWithContainer.childNodes[0].innerText = '0';
    console.log(payWithContainer.children)
    for (let i = 0; i < 4; i++) {
        let val = SELECTEDSTATS.get(ELEMENTS[i]);
        if (val == undefined) val = 0;
        // if (card == undefined) { payWithContainer.children[i].innerText = `${val}` }
        // else {
        payWithContainer.children[i].innerText = `${val}`
        // }
    }
}

const cleanupMirror = () => {
    // cleanup mirror
    document.getElementById('selectedCard').innerHTML = ''
    document.getElementById('selectedCard').className = 'card'
    document.getElementById('selectedDescription').innerHTML = "<p></p>"
    document.getElementById('transactionAction').disabled = true;
    document.getElementById('ignoreAction').disabled = true;
    document.getElementById('confirmAction').classList.add('hidden')
    document.getElementById('payWithLabel').classList.add('hidden');
    document.getElementById('payWith').classList.add('hidden');

}

const showBuyResourceManager = () => {
    // let label = document.getElementById('payWithLabel')
    // label.classList.remove('hidden')
    let label = document.createElement('div');
    label.id = 'payWithLabel';
    label.innerText = 'SELECTED RESOURCES';
    let payWith = document.getElementById('payWith')
    payWith.classList.remove('hidden');
    payWith.parentNode.insertBefore(label, payWith);

}

const showBuyOptions = (cardType) => {
    let transaction = document.getElementById('transactionAction');
    let buttonText = '';
    switch (cardType) {
        case 'red':
            buttonText = 'BRIBE'
            break;
        case 'yellow': buttonText = 'HIRE'
            break;
        default: buttonText = 'AQUIRE'
            break;
    }
    transaction.innerHTML = buttonText;
}



window.onload = () => {
    VISIBLE = false;
    RESOURCESTATS = new Map();
    setupPlayerInfo();
    // generateMap(31, 15);
    generateMap(15, 18);
    generateRandomPathTiles();
    movePoint()
    console.log("generated");
    generateCards();
    gameLoop();
};