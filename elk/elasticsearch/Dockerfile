FROM elasticsearch:8.12.2

RUN bin/elasticsearch-plugin install analysis-nori

COPY ./custom_dictionary.txt /usr/share/elasticsearch/config/custom_dictionary.txt
COPY ./custom_synonym.txt /usr/share/elasticsearch/config/custom_synonym.txt