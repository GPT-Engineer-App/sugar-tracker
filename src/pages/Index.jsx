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
    }
  }, [records, viewMode]);
};

export default Index;
