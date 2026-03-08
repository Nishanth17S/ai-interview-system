"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function InterviewAnalytics({ metrics }) {

  const data = {
    labels: metrics.timestamps,

    datasets: [
      {
        label: "Confidence",
        data: metrics.confidence,
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.4)"
      },
      {
        label: "Eye Contact",
        data: metrics.eyeContact,
        borderColor: "rgb(16,185,129)",
        backgroundColor: "rgba(16,185,129,0.4)"
      },
      {
        label: "Smile",
        data: metrics.smile,
        borderColor: "rgb(234,179,8)",
        backgroundColor: "rgba(234,179,8,0.4)"
      }
    ]
  };

  return (

    <div className="bg-zinc-900 p-6 rounded-xl mt-6">

      <h2 className="text-xl font-bold mb-4">
        Interview Analytics
      </h2>

      <Line data={data} />

    </div>

  );

}