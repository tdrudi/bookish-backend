--- Tables ---
CREATE TABLE Books(
    olid VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    cover_url VARCHAR,
    description VARCHAR
);

CREATE TABLE Users(
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    profile_img_url VARCHAR,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Following(
    id SERIAL PRIMARY KEY ,
    user_id INTEGER NOT NULL,
    follower_id INTEGER NOT NULL,
    status VARCHAR NOT NULL,     -- 'pending', 'accepted', 'declined', 'blocked'
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADe,
    FOREIGN KEY (follower_id) REFERENCES Users(id) ON DELETE CASCADE
);


--- Books -> Reviews, Ratings, Lists, Genres ---
CREATE TABLE Reviews(
    id SERIAL PRIMARY KEY ,
    book_id VARCHAR NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES Books(olid) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Lists(
    id SERIAL PRIMARY KEY ,
    user_id INTEGER NOT NULL,
    list_name VARCHAR NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    book_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE List_Books(
    id SERIAL PRIMARY KEY ,
    list_id INTEGER NOT NULL,
    book_id VARCHAR NOT NULL,
    FOREIGN KEY (list_id) REFERENCES Lists(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(olid) ON DELETE CASCADE
);

CREATE TABLE Genres(
    id SERIAL PRIMARY KEY ,
    name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE Book_Genres(
    id SERIAL PRIMARY KEY ,
    book_id VARCHAR NOT NULL,
    genre_id INTEGER NOT NULL,
    FOREIGN KEY (book_id) REFERENCES Books(olid) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genres(id) ON DELETE CASCADE
);

CREATE TABLE Comments(
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parent_comment_id INTEGER NULL,  -- Nullable for nested comments
    comment_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES Reviews(id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(id) ON DELETE CASCADE -- Self-referential
);