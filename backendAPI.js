const BASE_API_URL = "https://openlibrary.org";
const BACKEND_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";
const axios = require("axios");

class BookishAPI {
    //----------------------------------- OPEN LIBRARY API ------------------------

    //Get book details by olid
    static async getBookDetails(olid) {
        try {
            const res = await axios.get(`${BASE_API_URL}/books/${olid}.json`);
            return res.data;
        } catch (error) {
            throw new Error('Failed to fetch book details');
        }
    }

    /**Returns data -> 
     * {
     description: {value} 
     title: ""
     *subjects: []
     *subject_places: []
     *subject_people: []
     authors: [key: "author/[olid]"]
     *pagination: ""
     *publish_date: ""
     *publishers: []

     }**/

    //et author by id
    static async getAuthorDetails(authorId) {
        try {
            const res = await axios.get(`${BASE_API_URL}/authors/${authorId}.json`);
            return res.data.name;
        } catch (error) {
            throw new Error('Failed to fetch book details');
        }
    }
    /**Returns data -> name: "" */

    //Get books by subject
    static async getBooksBySubject(subject) {
        try {
            const res = await axios.get(`${BASE_API_URL}/subjects/${subject}.json`);
            return res.data;
        } catch (error) {
            throw new Error('Failed to fetch book details');
        }
    }

    //Search by title
    static async search(query) {
        try {
            //replace white space with "+" for query
            let q = query.replace(/\s+/g, '+');
            const res = await axios.get(`${BASE_API_URL}/search.json?title=${q}&limit=15`)
            return res.data;
        } catch (err) {
            throw new Error('No results found.')
        }
    }


    //----------------------------------- BACKEND ROUTES ------------------------
    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);
        const url = `${BACKEND_URL}/${endpoint}`;
        // const headers = { Authorization: `Bearer ${token}` };
        const params = (method === "get") ? data : {};

        try {
            let res = (await axios.get({ url, method, data, params, headers }));
            return res.data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

}

module.exports = BookishAPI;