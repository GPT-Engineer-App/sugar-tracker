import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Container, Heading, Input, Text, VStack, List, ListItem, ListIcon, useToast, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { FaCheckCircle, FaPlus, FaChevronDown } from "react-icons/fa";

import { client } from "lib/crud";

const Index = () => {
  const [bloodSugar, setBloodSugar] = useState("");
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const data = await client.getWithPrefix("record:");
    if (data) {
      setRecords(data.map((item) => item.value));
    }
  };

  const handleAddRecord = async () => {
    if (!bloodSugar) {
      toast({
        title: "Error",
        description: "Please enter a blood sugar level.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const key = `record:${new Date().toISOString()}`;
    const success = await client.set(key, { bloodSugar, date: new Date().toISOString() });

    if (success) {
      setRecords([...records, { bloodSugar, date: new Date().toISOString() }]);
      setBloodSugar("");
      toast({
        title: "Record added",
        description: "Your blood sugar level has been logged.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const calculateA1c = (period) => {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - period);
    const filteredRecords = records.filter((record) => new Date(record.date) >= cutoffDate);
    const averageGlucose = filteredRecords.reduce((acc, curr) => acc + parseFloat(curr.bloodSugar), 0) / filteredRecords.length;
    return (averageGlucose + 46.7) / 28.7;
  };

  const sortRecords = () => {
    setRecords([...records].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const [viewMode, setViewMode] = useState("graph");
  const graphRef = useRef(null);

  useEffect(() => {
    if (viewMode === "graph" && graphRef.current) {
      const svg = d3.select(graphRef.current).append("svg").attr("width", "100%").attr("height", "100%");

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(records, (record) => new Date(record.date)))
        .range([0, graphRef.current.clientWidth]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(records, (record) => record.bloodSugar)])
        .range([graphRef.current.clientHeight, 0]);

      const line = d3
        .line()
        .x((record) => xScale(new Date(record.date)))
        .y((record) => yScale(record.bloodSugar))
        .curve(d3.curveMonotoneX);

      svg.append("path").datum(records).attr("fill", "none").attr("stroke", "blue").attr("stroke-width", 2).attr("d", line);
    }
  }, [records, viewMode]);
};

export default Index;
