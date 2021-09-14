const getUserInfo = (req, res) => {
    console.log(req.user)
    res.json({
        id: req.user.id,
        userId : req.user.userid,
        username: req.user.username,
        authority: req.user.authority 
    });
}

module.exports = {
    getUserInfo 
}