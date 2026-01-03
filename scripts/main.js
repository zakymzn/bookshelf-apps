const bookList = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF-APPS';

document.addEventListener('DOMContentLoaded', () => {
  const buttonSubmitBook = document.getElementById('bookFormSubmit');
  const buttonSubmitSearch = document.getElementById('searchSubmit');

  buttonSubmitBook.addEventListener('click', (event) => {
    event.preventDefault();
    addBook();
  });

  buttonSubmitSearch.addEventListener('click', (event) => {
    event.preventDefault();
    searchBook();
  });

  if (storageAvailable()) {
    loadFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  const hasIncomplete = bookList.some(book => !book.isComplete);
  const hasComplete = bookList.some(book => book.isComplete);

  if (!hasIncomplete) {
    incompleteBookList.innerHTML = `<div id="noIncompleteBook" class='no-books'>&#9785 Kamu belum membaca buku apapun</div>`;
  } else {
    incompleteBookList.innerHTML = '';
  }

  if (!hasComplete) {
    completeBookList.innerHTML = `<div id="noCompleteBook" class='no-books'>&#9785 Belum ada buku yang selesai dibaca nih</div>`;
  } else {
    completeBookList.innerHTML = '';
  }

  for (const bookItem of bookList) {
    const book = setBookData(bookItem);

    if (!bookItem.isComplete) {
      incompleteBookList.append(book);
    } else {
      completeBookList.append(book);
    }
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById('bookFormIsComplete').addEventListener('input', () => {
  const isComplete = document.getElementById('bookFormIsComplete').checked;
  const isCompleteButtonText = document.getElementById('isCompleteButtonText');

  if (isComplete) {
    isCompleteButtonText.innerText = 'Selesai dibaca';
  } else {
    isCompleteButtonText.innerText = 'Belum selesai dibaca';
  }
});

document.getElementById('copyright').innerHTML = `&copy; ${new Date().getFullYear()} by Ma'mur Zaky Nurrokhman`;

const addBook = () => {
  const bookTitle = document.getElementById('bookFormTitle').value;
  const bookAuthor = document.getElementById('bookFormAuthor').value;
  const bookYear = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  if (!bookTitle) {
    return alert('Judul buku harus diisi');
  }

  if (!bookAuthor) {
    return alert('Penulis buku harus diisi');
  }

  if (!bookYear) {
    return alert('Tahun penerbitan buku harus diisi');
  }

  const generateID = generateId();
  const bookData = generateBookData(generateID, bookTitle, bookAuthor, bookYear, isComplete);

  bookList.push(bookData);
  
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();

  return isComplete;
}

const generateId = () => {
  return +new Date();
}

const generateBookData = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

const saveData = () => {
  if (storageAvailable()) {
    const parsed = JSON.stringify(bookList);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const storageAvailable = () => {
  if (typeof (Storage) === undefined) {
    alert("Browser ini tidak mendukung local storage");
    return false;
  }
  return true;
}

const setBookData = (bookData) => {
  const bookCard = document.createElement('div');
  bookCard.setAttribute('class', 'book-card');
  bookCard.setAttribute('data-bookid', `${bookData.id}`);
  bookCard.setAttribute('data-testid', 'bookItem');

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = bookData.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${bookData.author}`;

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${bookData.year}`;

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.setAttribute('class', 'delete-button');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', () => {
    deleteBook(bookData.id);
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', () => {
    editBook(bookData.id);
  });

  const buttonsContainer = document.createElement('div');
  buttonsContainer.setAttribute('class', 'inline-container');

  if (bookData.isComplete) {
    const bookIsIncompleteButton = document.createElement('button');
    bookIsIncompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    bookIsIncompleteButton.innerText = 'Belum selesai dibaca';
    bookIsIncompleteButton.addEventListener('click', () => {
      setBookIsComplete(bookData.id, false);
    });

    buttonsContainer.append(bookIsIncompleteButton, deleteButton, editButton);
  } else {
    const bookIsCompleteButton = document.createElement('button');
    bookIsCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    bookIsCompleteButton.innerText = 'Selesai dibaca';
    bookIsCompleteButton.addEventListener('click', () => {
      setBookIsComplete(bookData.id, true);
    });

    buttonsContainer.append(bookIsCompleteButton, deleteButton, editButton);
  }

  bookCard.append(bookTitle, bookAuthor, bookYear, buttonsContainer);

  return bookCard;
}

const loadFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let localData = JSON.parse(serializedData);

  if (localData !== null) {
    for (const book of localData) {
      bookList.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const setBookIsComplete = (bookId, isComplete) => {
  const book = searchBookById(bookId);

  if (book === null) {
    return;
  }

  book.isComplete = isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

const deleteBook = (bookId) => {
  const book = searchBookById(bookId);

  if (book === null) {
    return;
  }

  bookList.splice(book, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

const editBook = (bookId) => {
  const editCard = document.getElementById('editCard');
  const main = document.getElementsByTagName('main')[0];
  const buttonCancel = document.getElementById('bookCancelEdit');
  const buttonSaveChanges = document.getElementById('bookEditFormSubmit');

  editCard.style.display = "block";
  main.style.filter = "blur(5px)";

  const bookData = bookList.find(book => book.id === bookId);
  console.log(bookData);

  let bookTitle = document.getElementById('bookEditFormTitle');
  let bookAuthor = document.getElementById('bookEditFormAuthor');
  let bookYear = document.getElementById('bookEditFormYear');

  bookTitle.value = bookData.title;
  bookAuthor.value = bookData.author;
  bookYear.value = bookData.year;

  console.log("title:", bookTitle.value);
  console.log("author:", bookAuthor.value);
  console.log("year:", bookYear.value);

  buttonCancel.addEventListener('click', () => {
    editCard.style.display = "none";
    main.style.filter = "none";
    bookTitle = '';
    bookAuthor = '';
    bookYear = '';
  });

  buttonSaveChanges.addEventListener('click', () => {
    if (!bookTitle) {
      return alert('Judul buku harus diisi');
    }

    if (!bookAuthor) {
      return alert('Penulis buku harus diisi');
    }

    if (!bookYear) {
      return alert('Tahun penerbitan buku harus diisi');
    }

    if (bookData) {
      bookData.title = bookTitle.value;
      bookData.author = bookAuthor.value;
      bookData.year = bookYear.value;
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });
}

const searchBookById = (bookId) => {
  for (const book of bookList) {
    if (book.id === bookId) {
      return book;
    }
  }

  return null;
}

const searchBook = () => {
  const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookCard = document.getElementsByClassName('book-card');

  for (let index = 0; index < bookCard.length; index++) {
    let bookTitle = bookCard[index].getElementsByTagName('h3')[0];
    let itemValue = bookTitle.textContent || bookTitle.innerText;

    if (itemValue.toLowerCase().indexOf(searchInput) > -1) {
      bookCard[index].style.display = "";
    } else {
      bookCard[index].style.display = "none";
    }
  }
}