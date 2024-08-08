import { Component } from "../../core/Component";

export interface Card {
    dom:HTMLElement;
    rect:DOMRect;
    position:number;
    index:number;
}

export class CardContainer extends Component {
    cards:Card[] = [];
    cardsDom:HTMLElement[] = [];
    dragging:boolean = false;
    dragIndex:number = -1;

    constructor(_dom:HTMLElement) {
        super(_dom);

        const cards = _dom.querySelectorAll('.pattern_composer');
        for(const card of cards) {
            this.cards.push({
                dom: card as HTMLElement,
                rect: card.getBoundingClientRect(),
                position: this.cards.length,
                index: this.cards.length
            });

            //@ts-ignore
            this.cardsDom.push(card);

            card.addEventListener('dragstart', e => {
                this.startDrag(e.target as HTMLElement);
            })

            card.addEventListener('dragend', e => {
                this.stopDrag();
            })

            card.addEventListener("dragover", e => {
                this.drag(e.currentTarget as HTMLElement)
            });
            
            const header = card.querySelector('header');
            this.addDragActions(cards.length-1, header);
        }
    }

    protected addDragActions(index:number, header:HTMLElement) {
        /* header.addEventListener('mousedown', e => {
            this.startDrag(this.cards[index], e.clientX, e.clientY);
        }); */
    }

    protected startDrag(dom:HTMLElement) {
        if(this.dragging) return;
        this.dragging = true;
        this.dragIndex = this.cardsDom.indexOf(dom);
        // card.dom.draggable = true;
        /* this.dragging = true;
        const box = card.dom.getBoundingClientRect();
        const el = card.dom.cloneNode(true) as HTMLElement;
        el.classList.add('dragger');
        el.style.left = `${box.left}px`;
        el.style.top = `${box.top}px`;
        el.style.width = `${box.width}px`;
        el.style.height = `${box.height}px`;
        document.body.appendChild(el);
        card.dom.classList.add('hidden');

        this.dragEl = el; */
    }

    protected drag(target:HTMLElement) {
        if(target === this.cards[this.dragIndex].dom) return;
        const pos1 = this.cards[this.dragIndex].position;
        console.log(this.cardsDom.indexOf(target));
        const card2 = this.cards[this.cardsDom.indexOf(target)];
        const pos2 = card2.position;
        // console.log('Dragging me over', pos1, pos2);
        this.swapPositions(this.cards[this.dragIndex], card2);
    }

    protected stopDrag() {
        if(!this.dragging) return;
        console.log('STOP DRAG')
        this.dragging = false;
        // this.cards[this.dragIndex].dom.draggable = false;
        this.dragIndex = -1;
    }

    protected swapPositions(card1:Card, card2:Card) {
        const tmp = card1.position;
        card1.position = card2.position;
        card2.position = tmp;

        this.updateCardPositions();
    }

    updateCardPositions() {
        for(const card of this.cards) {
            const offset = card.position - card.index;
            card.dom.style.transform = `translateX(${offset*100}%)`;
        }
    }
}