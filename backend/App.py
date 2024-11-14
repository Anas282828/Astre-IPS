from flask import Flask, jsonify, request
import pandas as pd
import os

app = Flask(__name__)
file_path = os.path.join(os.path.dirname(__file__), 'Qui es tu _ (réponses) - Réponses filtrées.csv')

def calculer_scores(weights):
    df = pd.read_csv(file_path)
    weights = {
        filiere: {hyp: int(value) for hyp, value in ponderations.items()}
        for filiere, ponderations in weights.items()
    }
    ponderations_ips = {
        5: ('ENSIMersion', weights['ips'].get('ensimersion', 0)),
        9: ('Oui', weights['ips'].get('oui', 0)),
        10: ('Ubisoft', weights['ips'].get('ubisoft', 0)),
        15: ('Informaticien', weights['ips'].get('informaticien', 0)),
        21: ('Non', weights['ips'].get('non', 0))
    }

    ponderations_astre = {
        8: ('GEII', weights['astre'].get('geii', 0)),
        10: ('STMicroelectronics', weights['astre'].get('stmicroelectronics', 0)),
        17: ('Arduino', weights['astre'].get('arduino', 0)),
        18: ('Linux', weights['astre'].get('linux', 0)),
        19: ('Jamais', weights['astre'].get('jamais', 0))
    }
    def score(row, ponderations):
        total = 0
        for col_num, (mot_cle, poids) in ponderations.items():
            if poids == 0:
                continue
            col_name = df.columns[col_num]
            if pd.notna(row[col_name]) and mot_cle in row[col_name]:
                total += poids
        return total

    df['Score_IPS'] = df.apply(lambda row: score(row, ponderations_ips), axis=1)
    df['Score_ASTRE'] = df.apply(lambda row: score(row, ponderations_astre), axis=1)

    total_ips = sum(df['Score_IPS'] > df['Score_ASTRE'])
    total_astre = sum(df['Score_ASTRE'] > df['Score_IPS'])
    total_both = sum(df['Score_IPS'] == df['Score_ASTRE'])

    categories = df[df.columns[1]].tolist()  
    data_ips = df['Score_IPS'].tolist()
    data_astre = df['Score_ASTRE'].tolist()

    return categories, data_ips, data_astre, total_ips, total_astre, total_both

@app.route('/data')
def data():
    default_weights = {
        'ips': {
            'ensimersion': 4,
            'oui': 2,
            'ubisoft': 4,
            'informaticien': 3,
            'non': 2
        },
        'astre': {
            'geii': 3,
            'stmicroelectronics': 4,
            'arduino': 3,
            'linux': 2,
            'jamais': 3
        }
    }
    categories, data_ips, data_astre, total_ips, total_astre, total_both = calculer_scores(default_weights)
    return jsonify(categories=categories, dataIPS=data_ips, dataASTRE=data_astre, totalIPS=total_ips, totalASTRE=total_astre, totalBoth=total_both)

@app.route('/update_weights', methods=['POST'])
def update_weights():
    weights = request.json
    categories, data_ips, data_astre, total_ips, total_astre, total_both = calculer_scores(weights)
    return jsonify(dataIPS=data_ips, dataASTRE=data_astre, totalIPS=total_ips, totalASTRE=total_astre, totalBoth=total_both)

if __name__ == '__main__':
    app.run(debug=True)
