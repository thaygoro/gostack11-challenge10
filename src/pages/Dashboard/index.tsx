import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      // LOAD FOODS
      const foodsToLoad = await api.get('/foods');
      setFoods(foodsToLoad.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      // ADD A NEW FOOD PLATE TO THE API
      const addFood = await api.post('/foods', {
        name: food.name,
        image: food.image,
        price: food.price,
        description: food.description,
        available: true,
      });

      setFoods([...foods, addFood.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    // UPDATE A FOOD PLATE ON THE API
    const updatedFood = await api.put(`/foods/${editingFood.id}`, {
      name: food.name,
      image: food.image,
      price: food.price,
      description: food.description,
      available: editingFood.available,
    });

    const foodsToUpdate = foods.map(f => {
      if (f.id === editingFood.id) {
        return updatedFood.data;
      }
      return f;
    });

    setFoods(foodsToUpdate);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    // DELETE A FOOD PLATE FROM THE API
    await api.delete(`/foods/${id}`);
    const foodsUpdated = foods.filter(food => food.id !== id);

    setFoods(foodsUpdated);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    // SET THE CURRENT EDITING FOOD ID IN THE STATE
    setEditingFood(food);
    setEditModalOpen(!editModalOpen);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
