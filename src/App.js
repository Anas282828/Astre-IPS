import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const App = () => {
  const [data, setData] = useState({ categories: [], dataIPS: [], dataASTRE: [] });
  const [totals, setTotals] = useState({ totalIPS: 0, totalASTRE: 0, totalBoth: 0 });
  const [weights, setWeights] = useState({
    ips: { ensimersion: 4, oui: 2, ubisoft: 4, informaticien: 3, non: 2 },
    astre: { geii: 3, stmicroelectronics: 4, arduino: 3, linux: 3, jamais: 2 }
  });

  const chartComponentRef = useRef(null);

  const hypothesisDetails = {
    ips: {
      ensimersion: "H1 : Quelles associations et événements t’intéressent ? : ENSIMersion",
      oui: "H2 : Envisages-tu l’auto-entreprenariat ? : Oui",
      ubisoft: "H3 : Quelles sont les entreprises qui pourraient t’intéresser ?  : Ubisoft",
      informaticien: "H4 : Petit, quel était ton métier de rêve ?  : Informaticien",
      non: "H5 : Envisagez vous un travail sans programmation plus tard ? : Non",
    },
    astre: {
      geii: "H1 : Quelles étaient tes spécialités ? : GEII",
      stmicroelectronics: "H2 : L'entreprise qui pourrait t’intéresser ? : STMicroelectronics",
      arduino: "H3 : Qu’est-ce que tu as sur ton bureau ? : Arduino",
      linux: "H4 : Quel(s) système(s) d’exploitation utilises-tu ? : Linux",
      jamais: "H5 : À quelle fréquence codes-tu pour des projets personnels ? : Jamais",
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (chartComponentRef.current) {
      setTimeout(() => {
        chartComponentRef.current.chart.reflow();
      }, 300);
    }
  }, [data]);

  const fetchData = () => {
    axios.get('/data').then(response => {
      setData(response.data);
      setTotals({
        totalIPS: response.data.totalIPS,
        totalASTRE: response.data.totalASTRE,
        totalBoth: response.data.totalBoth
      });
    });
  };

  const updateWeights = (filiere, hypothese, value) => {
    const newWeights = { ...weights };
    newWeights[filiere][hypothese] = value;
    setWeights(newWeights);

    axios.post('/update_weights', newWeights).then(response => {
      setData({ ...data, dataIPS: response.data.dataIPS, dataASTRE: response.data.dataASTRE });
      setTotals({
        totalIPS: response.data.totalIPS,
        totalASTRE: response.data.totalASTRE,
        totalBoth: response.data.totalBoth
      });
    });
  };

  const chartOptions = {
    chart: { type: 'column' },
    title: { text: 'Comparaison des points IPS et ASTRE par étudiant' },
    xAxis: {
      categories: data.categories,
      labels: {
        rotation: -45,
        style: { fontSize: '10px' }
      }
    },
    yAxis: { min: 0, title: { text: 'Points' } },
    plotOptions: {
      column: {
        pointPadding: 0.1,
        borderWidth: 0
      }
    },
    series: [
      { name: 'IPS', data: data.dataIPS, color: '#00aaff' },
      { name: 'ASTRE', data: data.dataASTRE, color: '#aa00ff' }
    ]
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Pondérations des Hypothèses</h2>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#00aaff', padding: '10px', borderRadius: '6px', color: 'white', width: '150px', textAlign: 'center'
        }}>
          <h4>Total IPS</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalIPS}</p>
        </div>
        <div style={{
          backgroundColor: '#aa00ff', padding: '10px', borderRadius: '6px', color: 'white', width: '150px', textAlign: 'center'
        }}>
          <h4>Total ASTRE</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalASTRE}</p>
        </div>
        <div style={{
          backgroundColor: '#ff9900', padding: '10px', borderRadius: '6px', color: 'white', width: '150px', textAlign: 'center'
        }}>
          <h4>Total pour les deux</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalBoth}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        {/* Hypothèses IPS */}
        <div style={{ width: '48%' }}>
          <h3 style={{ textAlign: 'center', color: '#00aaff' }}>Hypothèses IPS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: '20px' }}>
            {Object.keys(weights.ips).map(hyp => (
              <div key={hyp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '5px' }}>
                  {hypothesisDetails.ips[hyp]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.ips[hyp]}
                  onChange={(e) => updateWeights('ips', hyp, +e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Hypothèses ASTRE */}
        <div style={{ width: '48%' }}>
          <h3 style={{ textAlign: 'center', color: '#aa00ff' }}>Hypothèses ASTRE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: '20px' }}>
            {Object.keys(weights.astre).map(hyp => (
              <div key={hyp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '5px' }}>
                  {hypothesisDetails.astre[hyp]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={weights.astre[hyp]}
                  onChange={(e) => updateWeights('astre', hyp, +e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique Highcharts */}
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartComponentRef}
      />
    </div>
  );
};

export default App;
