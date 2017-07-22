import logging
import _pickle as cPickle
from google.cloud import bigquery
from sys import getsizeof

ID_IN_TUPLE = 0
MAX_QUEUE_SIZE = 1048576

class BigQueryClient:
    def __init__(self):
        self._queue = []

        bc = bigquery.Client('gutenberg-161202')
        dataset = bc.dataset('articles')
        dataset.exists()
        table = dataset.table('articles')
        table.reload()
        self._table = table

    def queue_add_article(self, article):
        self._queue.append((
            article.url,
            article.text,
            article.summary,
            article.image,
            article.get_movies(),
            article.get_authors(),
            article.get_keywords(),
            article.html,
        ))

        if self._should_flush_queue():
            self.flush_queue()


    def flush_queue(self):
        ids = [x[ID_IN_TUPLE] for x in self._queue]
        logging.info('Sending {} elements with ids {}'.format(len(self._queue), ids))
        errors = self._table.insert_data(self._queue, ids)

        if errors:
            raise IOError("Error sending data to BigQuery.\n BigQuery answer {}".format(errors))

        self._queue = []


    def _should_flush_queue(self):
        queue_string = cPickle.dumps(self._queue)

        # BigQuery doesnt' want request with more than 10MB payload
        return getsizeof(queue_string) > MAX_QUEUE_SIZE * 0.8


