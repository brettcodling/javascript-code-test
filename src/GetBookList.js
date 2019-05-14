const ucfirst = string => string.charAt(0).toUpperCase() + string.slice(1);

class BookList {
  constructor(apiUrl = 'http://api.book-seller-example.com', format = 'json') {
    this.apiUrl = apiUrl;
    this.format = format;
  }
  buildUrl(method, query, limit) {
    this.apiUrl += `/${method}?q=${query}&limit=${limit}&format=${this.format}`;
  }
  getBooksByAuthor(authorName = '', limit = 10) {
    this.buildUrl('by-author', authorName, limit);
    return this.performRequest();
  }
  getBooksByPublisher(publisher = '', limit = 10) {
    this.buildUrl('by-publisher', publisher, limit);
    return this.performRequest();
  }
  getBooksByYearPublished(year = '', limit = 10) {
    this.buildUrl('by-year-published', year, limit);
    return this.performRequest();
  }
  getJsonResults() {
    return JSON.parse(this.xhr.responseText).map((item) => {
      return {
        title: item.book.title,
        author: item.book.author,
        isbn: item.book.isbn,
        quantity: item.stock.quantity,
        price: item.stock.price
      };
    });
  }
  getResults() {
    const formatMethod = `get${ucfirst(this.format)}Results`;
    if (typeof this[formatMethod] === "function") {
      return this[formatMethod]();
    }
    return [];
  }
  getXmlResults() {
    return this.xhr.responseXML.documentElement.childNodes.map((item) => {
      return {
        title: item.childNodes[0].childNodes[0].nodeValue,
        author: item.childNodes[0].childNodes[1].nodeValue,
        isbn: item.childNodes[0].childNodes[2].nodeValue,
        quantity: item.childNodes[1].childNodes[0].nodeValue,
        price: item.childNodes[1].childNodes[1].nodeValue
      };
    });
  }
  performRequest() {
    return new Promise((resolve, reject) => {
      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', this.apiUrl, true);
      this.xhr.setRequestHeader('Accept', `application/${this.format.toLowerCase()}`);
    	this.xhr.onload = () => {
        if (this.xhr.status == 200) {
          resolve(this.getResults());
        } else {
          reject(`Request failed.  Returned status of ${this.xhr.status}`);
        }
      }
    	this.xhr.send();
    });
  }
}

const jsonBookList = new BookList();
jsonBookList.getBooksByAuthor('George R. R. Martin', 20)
  .then((result) => {
    console.log(result);
  })
  .error((error) => {
    console.log(error);
  });