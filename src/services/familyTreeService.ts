import { Person, Couple } from '../types';
import { supabase, PROFILE_IMAGES_BUCKET } from '../lib/supabase';

// Default profile images (now served from Supabase Storage or fallback to local)
export const DEFAULT_IMAGES = {
  male: './man.png',
  female: './woman.png'
};

// Admin credentials - In production, use Supabase Auth
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

// Helper function to upload image to Supabase Storage
async function uploadImageToStorage(file: File, personId: string | number): Promise<string | null> {
  try {
    console.log('🔄 Starting image upload for person:', personId);
    console.log('📁 File details:', { name: file.name, size: file.size, type: file.type });
    console.log('🪣 Using bucket:', PROFILE_IMAGES_BUCKET);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `person-${personId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log('📝 Generated file path:', filePath);

    const { data, error } = await supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    console.log('📤 Upload result:', { data, error });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    console.log('🔗 Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Helper function to delete image from Supabase Storage
async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    await supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .remove([fileName]);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// API functions
export async function getPeople(): Promise<Person[]> {
  try {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching people:', error);
      return [];
    }

    return data.map(person => ({
      id: person.id,
      name: person.name,
      gender: person.gender,
      imageUrl: person.image_url,
      created_at: person.created_at,
      updated_at: person.updated_at
    }));
  } catch (error) {
    console.error('Error fetching people:', error);
    return [];
  }
}

export async function getCouples(): Promise<Couple[]> {
  try {
    const { data: couplesData, error: couplesError } = await supabase
      .from('couples')
      .select('*')
      .order('created_at', { ascending: true });

    if (couplesError) {
      console.error('Error fetching couples:', couplesError);
      return [];
    }

    // Get children for each couple
    const couples: Couple[] = [];
    for (const couple of couplesData) {
      const { data: childrenData, error: childrenError } = await supabase
        .from('couple_children')
        .select('child_id')
        .eq('couple_id', couple.id);

      if (childrenError) {
        console.error('Error fetching children for couple:', childrenError);
        continue;
      }

      couples.push({
        id: couple.id,
        husbandId: couple.husband_id,
        wifeId: couple.wife_id,
        childrenIds: childrenData.map(child => child.child_id),
        created_at: couple.created_at,
        updated_at: couple.updated_at
      });
    }

    return couples;
  } catch (error) {
    console.error('Error fetching couples:', error);
    return [];
  }
}

export async function addPerson(name: string, gender: 'male' | 'female', imageFile?: File): Promise<Person> {
  try {
    console.log('👤 Adding person:', { name, gender, hasImageFile: !!imageFile });
    
    // First, insert the person to get an ID
    const { data, error } = await supabase
      .from('people')
      .insert([
        {
          name,
          gender,
          image_url: null
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error adding person: ${error.message}`);
    }

    console.log('✅ Person inserted with ID:', data.id);

    let imageUrl: string | null = null;
    
    // If image file provided, upload it
    if (imageFile) {
      console.log('🖼️ Processing image upload...');
      imageUrl = await uploadImageToStorage(imageFile, data.id);
      console.log('🖼️ Upload completed, imageUrl:', imageUrl);
      
      // Update person with image URL
      if (imageUrl) {
        console.log('💾 Updating person with image URL...');
        const { error: updateError } = await supabase
          .from('people')
          .update({ image_url: imageUrl })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error updating person with image URL:', updateError);
        } else {
          console.log('✅ Person updated with image URL successfully');
        }
      }
    }

    return {
      id: data.id,
      name: data.name,
      gender: data.gender,
      imageUrl: imageUrl || data.image_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error adding person:', error);
    throw error;
  }
}

export async function updatePerson(
  id: number | string, 
  name: string, 
  gender: 'male' | 'female', 
  imageFile?: File, 
  clearImage?: boolean
): Promise<Person> {
  try {
    console.log('✏️ Updating person:', { id, name, gender, hasImageFile: !!imageFile, clearImage });
    
    // Get current person data
    const { data: currentPerson, error: fetchError } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Person not found: ${fetchError.message}`);
    }

    console.log('📋 Current person data:', currentPerson);

    let imageUrl = currentPerson.image_url;

    // Handle image operations
    if (clearImage) {
      console.log('🗑️ Clearing image...');
      // Delete old image if exists
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      imageUrl = null;
    } else if (imageFile) {
      console.log('🔄 Replacing image...');
      // Delete old image if exists
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      // Upload new image
      imageUrl = await uploadImageToStorage(imageFile, id);
      console.log('🖼️ New image URL:', imageUrl);
    }

    console.log('💾 Updating person in database with imageUrl:', imageUrl);

    // Update person
    const { data, error } = await supabase
      .from('people')
      .update({
        name,
        gender,
        image_url: imageUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating person: ${error.message}`);
    }

    console.log('✅ Person updated successfully:', data);
    return {
      id: data.id,
      name: data.name,
      gender: data.gender,
      imageUrl: data.image_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating person:', error);
    throw error;
  }
}

export async function deletePerson(id: number | string): Promise<void> {
  try {
    // Get person data to delete image if exists
    const { data: person, error: fetchError } = await supabase
      .from('people')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Person not found: ${fetchError.message}`);
    }

    // Delete image from storage if exists
    if (person.image_url) {
      await deleteImageFromStorage(person.image_url);
    }

    // Delete person (cascading deletes will handle couples and couple_children)
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting person: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
}

export async function addCouple(husbandId: number | string, wifeId: number | string): Promise<Couple> {
  try {
    const { data, error } = await supabase
      .from('couples')
      .insert([
        {
          husband_id: husbandId,
          wife_id: wifeId
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating couple: ${error.message}`);
    }

    return {
      id: data.id,
      husbandId: data.husband_id,
      wifeId: data.wife_id,
      childrenIds: [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error creating couple:', error);
    throw error;
  }
}

export async function updateCoupleChildren(coupleId: number | string, childrenIds: (number | string)[]): Promise<void> {
  try {
    // Insert new children relationships (ignore duplicates)
    const childrenToInsert = childrenIds.map(childId => ({
      couple_id: coupleId,
      child_id: childId
    }));

    const { error } = await supabase
      .from('couple_children')
      .upsert(childrenToInsert, { 
        onConflict: 'couple_id,child_id',
        ignoreDuplicates: true 
      });

    if (error) {
      throw new Error(`Error adding children to couple: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating couple children:', error);
    throw error;
  }
}

export async function resetData(): Promise<void> {
  try {
    // Delete all data in correct order (due to foreign key constraints)
    await supabase.from('couple_children').delete().neq('couple_id', 0);
    await supabase.from('couples').delete().neq('id', 0);
    
    // Get all people with images to delete from storage
    const { data: people } = await supabase
      .from('people')
      .select('image_url')
      .not('image_url', 'is', null);

    // Delete images from storage
    if (people) {
      for (const person of people) {
        if (person.image_url) {
          await deleteImageFromStorage(person.image_url);
        }
      }
    }

    await supabase.from('people').delete().neq('id', 0);
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
}

// Authentication functions (keeping simple for demo - use Supabase Auth in production)
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem('adminLoggedIn') === 'true';
}

export function loginAdmin(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem('adminLoggedIn', 'true');
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  localStorage.removeItem('adminLoggedIn');
}

// Legacy functions for backward compatibility (now using Supabase)
export async function loadFamilyData() {
  const [people, couples] = await Promise.all([getPeople(), getCouples()]);
  return { people, couples };
}

export function saveFamilyData() {
  // No longer needed as data is saved directly to Supabase
  console.log('Data automatically saved to Supabase');
}