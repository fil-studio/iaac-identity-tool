import { Component } from "../../core/Component";

export interface Card {
    dom:HTMLElement;
    rect:DOMRect;
    position:number;
    index:number;
}

export interface CardListener {
    onCardSelected(id:string, card:Card);
    onCardSwap(id:string);
}

export class CardContainer extends Component {
    cards:Card[] = [];
    cardsDom:HTMLElement[] = [];
    dragging:boolean = false;
    dragIndex:number = -1;
    
    listeners:CardListener[] = [];

    id:string;

    constructor(_id:string, _dom:HTMLElement) {
        super(_dom);

        this.id = _id;

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
            
        }

        this.addTileEvents();
    }

    protected addTileEvents() {
        const tiles = this.dom.querySelectorAll('.tile');
        for(let i=0; i<tiles.length; i++) {
            const t = tiles[i] as HTMLElement;
            t.onclick = () => {
                for(const lis of this.listeners) {
                    lis.onCardSelected(this.id, this.cards[i]);
                }
            }
        }
    }

    addCardListener(lis:CardListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeCardListener(lis:CardListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    protected startDrag(dom:HTMLElement) {
        if(this.dragging) return;
        this.dragging = true;
        this.dragIndex = this.cardsDom.indexOf(dom);
    }

    protected drag(target:HTMLElement) {
        if(target === this.cards[this.dragIndex].dom) return;
        const card2 = this.cards[this.cardsDom.indexOf(target)];
        this.swapPositions(this.cards[this.dragIndex], card2);
    }

    protected stopDrag() {
        if(!this.dragging) return;
        // console.log('STOP DRAG')
        this.dragging = false;
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
            card.dom.style.transform = `translateX(${offset*101}%)`;
        }

        for(const lis of this.listeners) {
            lis.onCardSwap(this.id);
        }
    }
}