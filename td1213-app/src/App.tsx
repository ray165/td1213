// Import required modules for React and TypeScript
import React, { useState } from 'react';

const provinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

const federalTaxBrackets = [
  { threshold: 50197, rate: 0.15 },
  { threshold: 100392, rate: 0.205 },
  { threshold: 155625, rate: 0.26 },
  { threshold: 221708, rate: 0.29 },
  { threshold: Infinity, rate: 0.33 }
];

const payIntervals = [
  { label: 'Weekly', multiplier: 52 },
  { label: 'Biweekly', multiplier: 26 },
  { label: 'Monthly', multiplier: 12 }
];

const App: React.FC = () => {
  const [province, setProvince] = useState(provinces[0]);
  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [rrspRoom, setRrspRoom] = useState<number>(0);
  const [fhsaRoom, setFhsaRoom] = useState<number>(0);
  const [rateOfReturn, setRateOfReturn] = useState<number>(7);
  const [plannedRrspContribution, setPlannedRrspContribution] = useState<number>(0);
  const [payInterval, setPayInterval] = useState(payIntervals[0].multiplier);
  const [yearsToWork, setYearsToWork] = useState<number>(0);

  const calculateContributionLimit = () => {
    return annualIncome * 0.18;
  };

  const calculateTaxLiability = (income: number, taxBrackets: { threshold: number; rate: number }[]) => {
    let tax = 0;
    let previousThreshold = 0;

    for (const bracket of taxBrackets) {
      if (income > bracket.threshold) {
        tax += (bracket.threshold - previousThreshold) * bracket.rate;
        previousThreshold = bracket.threshold;
      } else {
        tax += (income - previousThreshold) * bracket.rate;
        break;
      }
    }
    return tax;
  };

  const calculateTaxReduction = () => {
    let taxableIncome = annualIncome - plannedRrspContribution;
    let taxBefore = calculateTaxLiability(annualIncome, federalTaxBrackets);
    let taxAfter = calculateTaxLiability(taxableIncome, federalTaxBrackets);
    return taxBefore - taxAfter;
  };

  const calculateTableData = () => {
    const intervalRate = Math.pow(1 + rateOfReturn / 100, 1 / payInterval) - 1;
    const contributionsPerInterval = plannedRrspContribution / payInterval;
    const rows = [];

    let runningBalance = 0;

    for (let year = 1; year <= yearsToWork; year++) {
      let totalContributed = 0;
      let contributionWithReturns = 0;

      for (let i = 0; i < payInterval; i++) {
        const compoundedContribution = contributionsPerInterval * Math.pow(1 + intervalRate, payInterval - i - 1);
        contributionWithReturns += compoundedContribution;
        totalContributed += contributionsPerInterval;
      }

      let previousBalanceCompounded = runningBalance * (1 + rateOfReturn / 100)
      runningBalance = previousBalanceCompounded + contributionWithReturns;
      rows.push({ year, totalContributed, contributionWithReturns, runningBalance });
    }

    return rows;
  };

  const tableData = calculateTableData();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>TD1213 Calculator</h1>

      <label>
        <strong>Select Province:</strong>
        <select value={province} onChange={(e) => setProvince(e.target.value)}>
          {provinces.map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        <strong>Annual Income:</strong>
        <input
          type="number"
          value={annualIncome}
          onChange={(e) => setAnnualIncome(Number(e.target.value))}
        />
      </label>
      <br /><br />

      <label>
        <strong>RRSP Contribution Room:</strong>
        <input
          type="number"
          value={rrspRoom}
          onChange={(e) => setRrspRoom(Number(e.target.value))}
        />
      </label>
      <br /><br />

      <label>
        <strong>FHSA Contribution Room:</strong>
        <input
          type="number"
          value={fhsaRoom}
          onChange={(e) => setFhsaRoom(Number(e.target.value))}
        />
      </label>
      <br /><br />

      <label>
        <strong>Planned RRSP Contribution:</strong>
        <input
          type="number"
          value={plannedRrspContribution}
          onChange={(e) => setPlannedRrspContribution(Number(e.target.value))}
        />
      </label>
      <br /><br />

      <label>
        <strong>Expected Rate of Return (%):</strong>
        <input
          type="number"
          value={rateOfReturn}
          onChange={(e) => setRateOfReturn(Number(e.target.value))}
        />
      </label>
      <br /><br />

      <label>
        <strong>Pay Interval:</strong>
        <select value={payInterval} onChange={(e) => setPayInterval(Number(e.target.value))}>
          {payIntervals.map((interval) => (
            <option key={interval.label} value={interval.multiplier}>{interval.label}</option>
          ))}
        </select>
      </label>
      <br /><br />

      <label>
        <strong>Years to Continue Working:</strong>
        <input
          type="number"
          value={yearsToWork}
          onChange={(e) => setYearsToWork(Number(e.target.value))}
        />
      </label>
      <br /><br />

      <h2>Results</h2>
      <p>Maximum RRSP Contribution Limit: ${calculateContributionLimit().toFixed(2)}</p>
      <p>Estimated Tax Reduction: ${calculateTaxReduction().toFixed(2)}</p>

      <h2>Contribution Table</h2>
      <table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Total Contributed</th>
            <th>Contribution w/ Returns</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.year}>
              <td>{row.year}</td>
              <td>${row.totalContributed.toFixed(2)}</td>
              <td>${row.contributionWithReturns.toFixed(2)}</td>
              <td>${row.runningBalance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
