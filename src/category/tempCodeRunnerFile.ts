
    private getCurrentPagePost = async(req, res, next) => {
        try {
            // 현재 분과
            const category = req.params.category;
            // 페이지 번호
            const pageNumber = req.params.page;
            // 전체 페이지
            const startIndex = ( pageNumber - 1) * 13;
            const posts = await database.getPagePosts(category, startIndex);
            res.json({ posts });
        } catch (error) {
            next(error);
        }
    };