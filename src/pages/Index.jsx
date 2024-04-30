import React, { useState, useEffect } from "react";
import { Box, Button, Container, Heading, Input, Text, VStack, List, ListItem, ListIcon, useToast, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { FaCheckCircle, FaPlus, FaChevronDown } from "react-icons/fa";
import { client } from "lib/crud";

const Index = () => {
  const [bloodSugar, setBloodSugar] = useState("");
  const [records, setRecords] = useState([]);
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

  return (
    <Container centerContent p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl">
          Diabetes Management App
        </Heading>
        <Text>Log and track your blood sugar levels.</Text>
        <Input placeholder="Enter your blood sugar level" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} />
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
        <Heading as="h2" size="lg">
          History
        </Heading>
        <List spacing={3}>
          {records.map((record, index) => (
            <ListItem key={index}>
              <ListIcon as={FaCheckCircle} color="green.500" />
              {`Level: ${record.bloodSugar}, Date: ${new Date(record.date).toLocaleString()}`}
            </ListItem>
          ))}
        </List>
      </VStack>
    </Container>
  );
};

export default Index;
