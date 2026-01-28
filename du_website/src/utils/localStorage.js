import Cookies from 'js-cookie';

class storage {
    static set(key, cartItems) {
        Cookies.set(key, JSON.stringify(cartItems))
    }

    static get(key) {
        return Cookies.get(key) ? JSON.parse(Cookies.get(key)) : null
    }
}

export default storage