module.exports = class {
    constructor(arrays) {
        this.arrays = arrays;
    }

    //Sắp xếp từ nhỏ đến lớn
    SortMinToMax() {
        return this.arrays.sort();
    }

    //Sắp xếp từ lớn đến nhỏ
    SortMaxToMin() {
        return this.arrays.reverse();
    }

    chooseFunction(Case) {
        switch (Case) {
            case "SortMinToMax":
                this.SortMinToMax();
                break;
            case "SortMaxToMin":
                this.SortMaxToMin();
                break;
            default:
                break;
        }
    }

}