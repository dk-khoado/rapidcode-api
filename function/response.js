
module.exports = function (errors, is_success, status_code, data_response, message) {
    var res = {
        errors: '',
        is_success: false,
        status_code: 200,
        data_response: [],
        message: ""
    }

    res.errors = errors;
    res.is_success = is_success;
    res.status_code = status_code;
    res.data_response = data_response;
    res.message = message;
    return res;
}
