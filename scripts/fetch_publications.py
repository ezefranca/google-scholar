from scholarly_publications import fetch_publications
import json
import os

def save_publications_to_json(publications, file_path):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as f:
        json.dump(publications, f, indent=4)

if __name__ == "__main__":
    scholar_id = os.getenv('SCHOLAR_ID')
    sortby = os.getenv('SORTBY', 'pubdate')
    if scholar_id:
        publications = fetch_publications(scholar_id, sortby=sortby)
        file_path = f'public/database/{scholar_id}.json'
        save_publications_to_json(publications, file_path)
    else:
        print("SCHOLAR_ID environment variable not set.")