class LinkedHashSet {
    constructor(){
        this.set = [];
    }

    add(elem){
        var i = this.find(elem);
        if(i >= 0)
            return !this.remove(elem);
        this.set.push(elem);
        return true;
    }

    remove(elem){
        var i = this.find(elem);
        if(i >= 0){
            this.set.splice(i,1);
            return true;
        }
        return false;
    }

    find(elem){
        return this.set.indexOf(elem);
    }

    print(){
        var res = this.set.map(function(node){return node.id});
        return res.toString();
    }
}