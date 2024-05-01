import React, { useState, useEffect } from "react";
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

  return (
    <Container centerContent p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl">
          Diabetes Management App
        </Heading>
        <Text>Log and track your blood sugar levels.</Text>
        <Input placeholder="Enter your blood sugar level" value={editingRecord ? editingRecord.bloodSugar : bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} />
        {editingRecord && <Input type="datetime-local" value={new Date(editingRecord.date).toISOString().slice(0, 16)} onChange={(e) => setEditingRecord({ ...editingRecord, date: new Date(e.target.value).toISOString() })} />}
        <Menu>
          <MenuButton as={Button} rightIcon={<FaChevronDown />}>
            Calculate A1c
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => toast({ title: `A1c for last week: ${calculateA1c(1 / 4).toFixed(2)}` })}>Weekly</MenuItem>
            <MenuItem onClick={() => toast({ title: `A1c for last month: ${calculateA1c(1).toFixed(2)}` })}>Monthly</MenuItem>
            <MenuItem onClick={() => toast({ title: `A1c for last 3 months: ${calculateA1c(3).toFixed(2)}` })}>Every 3 Months</MenuItem>
            <MenuItem onClick={() => toast({ title: `A1c for last 6 months: ${calculateA1c(6).toFixed(2)}` })}>Every 6 Months</MenuItem>
          </MenuList>
        </Menu>
        <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={handleAddRecord}>
          Add Record
        </Button>
        <Button onClick={sortRecords}>Sort History</Button>
        <Button onClick={() => setViewMode(viewMode === "list" ? "graph" : "list")}>{viewMode === "list" ? "Show Graph" : "Show List"}</Button>
        <Heading as="h2" size="lg">
          History
        </Heading>
        {viewMode === "list" ? (
          <List spacing={3}>
            {records.map((record, index) => {
              const handleDelete = async () => {
                const success = await client.delete(`record:${record.date}`);
                if (success) {
                  const updatedRecords = records.filter((r) => r.date !== record.date);
                  setRecords(updatedRecords);
                  toast({
                    title: "Record deleted",
                    description: "The record has been successfully deleted.",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  });
                }
              };
              const handleEdit = () => {
                setBloodSugar(record.bloodSugar);
                setEditingRecord(record);
              };
              return (
                <ListItem key={index}>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  {`Level: ${record.bloodSugar}, Date: ${new Date(record.date).toLocaleString()}`}
                  <Button size="sm" colorScheme="blue" onClick={handleEdit} ml={2}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={handleDelete} ml={2}>
                    Delete
                  </Button>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box border="1px" borderColor="gray.200" p={4} position="relative" height="200px" width="100%">
            <Text position="absolute" left="0" bottom="-20px">
              0
            </Text>
            <Text position="absolute" right="0" bottom="-20px">
              Records
            </Text>
            <Text position="absolute" left="-30px" top="0">
              300
            </Text>
            <Text position="absolute" left="-10px" bottom="0">
              0
            </Text>
            <svg width="100%" height="100%" style={{ position: "absolute", top: "0", left: "0" }}>
              <polyline
                points={records
                  .map((record, index) => {
                    const x = (index / records.length) * 100;
                    const y = (1 - record.bloodSugar / 300) * 100;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="blue"
                strokeWidth="2"
              />
              {records.map((record, index) => {
                const x = (index / records.length) * 100;
                const y = (1 - record.bloodSugar / 300) * 100;
                return (
                  <>
                    <circle cx={`${x}%`} cy={`${y}%`} r="5" fill="blue.500" />
                    <text x={`${x}%`} y={`${y - 10}%`} fontSize="xs" fill="black">
                      {record.bloodSugar}
                    </text>
                  </>
                );
              })}
            </svg>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Index;
