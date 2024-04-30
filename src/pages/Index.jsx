import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  List,
  ListItem,
  ListIcon,
  useToast
} from '@chakra-ui/react';
import { FaCheckCircle, FaPlus } from 'react-icons/fa';
import { client } from 'lib/crud';

const Index = () => {
  const [bloodSugar, setBloodSugar] = useState('');
  const [records, setRecords] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const data = await client.getWithPrefix('record:');
    if (data) {
      setRecords(data.map(item => item.value));
    }
  };

  const handleAddRecord = async () => {
    if (!bloodSugar) {
      toast({
        title: 'Error',
        description: "Please enter a blood sugar level.",
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const key = `record:${new Date().toISOString()}`;
    const success = await client.set(key, { bloodSugar, date: new Date().toISOString() });

    if (success) {
      setRecords([...records, { bloodSugar, date: new Date().toISOString() }]);
      setBloodSugar('');
      toast({
        title: 'Record added',
        description: "Your blood sugar level has been logged.",
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Container centerContent p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl">Diabetes Management App</Heading>
        <Text>Log and track your blood sugar levels.</Text>
        <Input
          placeholder="Enter your blood sugar level"
          value={bloodSugar}
          onChange={(e) => setBloodSugar(e.target.value)}
        />
        <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={handleAddRecord}>
          Add Record
        </Button>
        <Heading as="h2" size="lg">History</Heading>
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