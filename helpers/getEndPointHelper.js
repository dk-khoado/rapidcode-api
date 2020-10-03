
module.exports = class {

    constructor(table_name, user_name) {
        this.user_name = user_name;
        this.table_name = table_name;
    }

    GetAll() {
        return `/api/v1/${this.user_name}/${this.table_name}/get`;
    }

    GetByID() {
        return `/api/v1/${this.user_name}/${this.table_name}/get/:id`;
    }

    Insert() {
        return `/api/v1/${this.user_name}/${this.table_name}/insert`;
    }

    Update() {
        return `/api/v1/${this.user_name}/${this.table_name}/update/:id`;
    }

    Delete() {
        return `/api/v1/${this.user_name}/${this.table_name}/delete`;
    }

    BaseURL(){
        return `https://ezcode.ddns.net`;
    }

    getAllEndPoint(){
        let endpoint_action = {
            //Các hàm đều phải cần truyền tham số vào, tham số của tất cả đều là table_name, user_name
            GET_ALL: this.GetAll(),
            GET_BY_ID: this.GetByID(),
            INSERT: this.Insert(),
            UPDATE: this.Update(),
            DELETE: this.Delete(),
            BASE_URL: this.BaseURL()
        };

        return endpoint_action;
    }

}