const auth = async (req, res, next) => {
    if(req.body.user == "nmj" && req.body.user == "nmJ2020Kop*") {
        req.body["id"] = "JKSDKLN3454597234KSDF";
        req.body["username"] = "nmj";
        res.send();
    } else {
        res.status(400).send({
            error: "User name or password is wrong!"
        });
    }

    next();
}

module.exports = auth;