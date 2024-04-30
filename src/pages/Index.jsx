import React, { useState, useEffect } from "react";
import { Box, Button, Container, Heading, Input, Text, VStack, List, ListItem, ListIcon, useToast, Select } from "@chakra-ui/react";
import { FaCheckCircle, FaPlus } from "react-icons/fa";
import { client } from "lib/crud";

const Index = () => {
  const [bloodSugar, setBloodSugar] = useState("");
  const [records, setRecords] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const sortedRecords = records.sort((a, b) => {
    if (sortOrder === "dateAsc") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortOrder === "dateDesc") {
      return new Date(b.date) - new Date(a.date);
    }
    return 0;
  });
  const toast = useToast();

  const calculateA1c = (period) => {
    toast({
      title: `A1c Calculation for ${period}`,
      description: "This feature is not yet implemented.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

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

  return (
    <Container centerContent p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl">
          Diabetes Management App
        </Heading>
        <Select placeholder="Sort by" onChange={(e) => setSortOrder(e.target.value)}>
          <option value="dateAsc">Date Ascending</option>
          <option value="dateDesc">Date Descending</option>
        </Select>
        <Text>Log and track your blood sugar levels.</Text>
        <Input placeholder="Enter your blood sugar level" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} />
        <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={handleAddRecord}>
          Add Record
        </Button>
        <Button colorScheme="blue" onClick={() => calculateA1c("weekly")}>
          Calculate Weekly A1c
        </Button>
        <Button colorScheme="blue" onClick={() => calculateA1c("monthly")}>
          Calculate Monthly A1c
        </Button>
        <Button colorScheme="blue" onClick={() => calculateA1c("threeMonths")}>
          Calculate 3-Month A1c
        </Button>
        <Button colorScheme="blue" onClick={() => calculateA1c("sixMonths")}>
          Calculate 6-Month A1c
        </Button>
        <Heading as="h2" size="lg">
          History
        </Heading>
        <List spacing={3}>
          {sortedRecords.map((record, index) => (
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
