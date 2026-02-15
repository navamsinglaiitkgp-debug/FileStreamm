exports.me = async (req, res) => {
    const user = req.user;
    res.status(200).json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
};  