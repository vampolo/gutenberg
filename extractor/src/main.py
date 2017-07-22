import logging
import newspaper
from urllib.parse import urlparse

from bigquery import BigQueryClient


logging.basicConfig(level=logging.INFO)


sources = [{
    'url': 'http://www.cnn.com',
    'lang': 'en'
},{
    'url': 'http://www.politico.com',
    'lang': 'en'
},{
    'url': 'http://www.ilfattoquotidiano.it',
    'lang': 'it'
},{
    'url': 'http://www.repubblica.it',
    'lang': 'it'
},{
    'url': 'http://www.nytimes.com',
    'lang': 'en'
}, {
    'url': 'https://www.washingtonpost.com/',
    'lang': 'en'
}, {
    'url': 'https://www.wsj.com/',
    'lang': 'en'
}, {
    'url': 'https://www.bloomberg.com/',
    'lang': 'en'
}, {
    'url': 'http://www.reuters.com/',
    'lang': 'en'
}, {
    'url': 'http://www.foxnews.com/',
    'lang': 'en'
}, {
    'url': 'http://www.cbsnews.com/',
    'lang': 'en'
}, {
    'url': 'https://www.theatlantic.com/',
    'lang': 'en'
}, {
    'url': 'http://www.reuters.com/',
    'lang': 'en'
}, {
    'url': 'https://www.bostonglobe.com/',
    'lang': 'en'
}, {
    'url': 'http://www.latimes.com/',
    'lang': 'en'
}, {
    'url': 'http://www.bbc.com/news',
    'lang': 'en'
}]


class Article:
    @classmethod
    def from_newspaper_article(cls, article):
        return cls(article.url, article.text, article.authors, article.top_image, article.movies, article.summary, article.keywords, article.html)


    def __init__(self, url, text, authors, image, movies, summary, keywords, html):
        self.url = url
        self.text = text
        self.image = image
        self.authors = authors
        self.movies = movies
        self.keywords = keywords
        self.html = html
        self.summary = summary

    def get_authors(self):
        return [{'name': x} for x in self.authors]

    def get_movies(self):
        return [{'url': x} for x in self.movies]

    def get_keywords(self):
        return [{'keyword': x} for x in self.keywords]

class Paper:
    def __init__(self, url, lang):
        self._url = url
        self._lang = lang
        # self._paper = newspaper.build(url, language = lang, memoize_articles=False)
        self._paper = newspaper.build(url, language = lang)
        self._parsed_paper_url = urlparse(url)

    def get_articles(self):
        paper = self._paper

        for article in paper.articles:
            if self.is_article_of_paper(article.url):
                article.download()
                if article.is_downloaded:
                    article.parse()
                    article.nlp()
                    yield Article.from_newspaper_article(article)

    def is_article_of_paper(self, url):
        logging.debug('checking if article of paper {} - {}'.format(self._parsed_paper_url.netloc, url))
        return self._parsed_paper_url.netloc == urlparse(url).netloc


client = BigQueryClient()

for source in sources:
    paper = Paper(source['url'], source['lang'])
    for article in paper.get_articles():
        client.queue_add_article(article)

client.flush_queue()




