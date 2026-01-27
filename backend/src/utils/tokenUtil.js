import jwt from 'jsonwebtoken';


export const generateAccessToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return token;
};

export const generateRefreshToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
};