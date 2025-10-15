import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/types';

// Função para sanitizar cores inválidas
function sanitizeColor(color: string | undefined | null): string {
  if (!color || typeof color !== 'string') return '#FFFFFF';
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  return hexPattern.test(color) ? color : '#FFFFFF';
}

// Função para sanitizar dados antes de salvar
function sanitizeAppData(data: AppData): AppData {
  return {
    settings: {
      ...data.settings,
      brandName: data.settings?.brandName || '',
      colorBackgroundRosa: sanitizeColor(data.settings?.colorBackgroundRosa),
      colorButtonPrimary: sanitizeColor(data.settings?.colorButtonPrimary),
      whatsappNumber: data.settings?.whatsappNumber || '',
      whatsappMessage: data.settings?.whatsappMessage || '',
      heroTitle: data.settings?.heroTitle || '',
      heroSubtitle: data.settings?.heroSubtitle || '',
      aboutTitle: data.settings?.aboutTitle || '',
      aboutText: data.settings?.aboutText || '',
      extraInfoTitle: data.settings?.extraInfoTitle || '',
      extraInfoText: data.settings?.extraInfoText || '',
      footerText: data.settings?.footerText || '',
    },
    products: Array.isArray(data.products) ? data.products : [],
    extras: Array.isArray(data.extras) ? data.extras : [],
    sections: Array.isArray(data.sections) ? data.sections : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

export async function saveDataToSupabase(data: AppData, bakeryId: string): Promise<boolean> {
  try {
    // Sanitizar dados antes de salvar
    const sanitizedData = sanitizeAppData(data);
    
    // Verificar sessão antes de qualquer operação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // 1. Atualizar bakeries (settings)
    const updateData = {
      confectionery_name: sanitizedData.settings.brandName,
      settings: sanitizedData.settings,
      updated_at: new Date().toISOString(),
    };
    
    const { error: bakeryError } = await supabase
      .from('bakeries')
      .update(updateData)
      .eq('id', bakeryId);

    if (bakeryError) throw bakeryError;

    // 2. Deletar produtos antigos e inserir novos
    const { error: deleteProductsError } = await supabase
      .from('products')
      .delete()
      .eq('bakery_id', bakeryId);
    
    if (deleteProductsError) throw deleteProductsError;

    if (sanitizedData.products && sanitizedData.products.length > 0) {
      const productsToInsert = sanitizedData.products.map((product) => ({
        id: product.id,
        bakery_id: bakeryId,
        name: product.name,
        price: product.sizes[0]?.price || 0,
        description: product.description,
        image_url: product.image,
        sizes: product.sizes,
        tags: product.tags || [],
        show_image: product.showImage !== false,
        product_order: product.order || 0,
      }));

      const { error: productsError } = await supabase
        .from('products')
        .insert(productsToInsert);
      
      if (productsError) throw productsError;
    }

    // 3. Deletar extras antigos e inserir novos
    const { error: deleteExtrasError } = await supabase
      .from('extras')
      .delete()
      .eq('bakery_id', bakeryId);
    
    if (deleteExtrasError) throw deleteExtrasError;

    if (sanitizedData.extras && sanitizedData.extras.length > 0) {
      const extrasToInsert = sanitizedData.extras.map((extra) => ({
        bakery_id: bakeryId,
        name: extra.name,
        description: extra.description,
        image_url: extra.image,
        price: extra.price,
        extra_order: extra.order || 0,
      }));

      const { error: extrasError } = await supabase
        .from('extras')
        .insert(extrasToInsert);
      
      if (extrasError) throw extrasError;
    }

    // 4. Deletar sections antigas e inserir novas
    const { error: deleteSectionsError } = await supabase
      .from('sections')
      .delete()
      .eq('bakery_id', bakeryId);
    
    if (deleteSectionsError) throw deleteSectionsError;

    if (sanitizedData.sections && sanitizedData.sections.length > 0) {
      const sectionsToInsert = sanitizedData.sections.map((section) => ({
        id: section.id,
        bakery_id: bakeryId,
        name: section.name,
        visible: section.visible !== false,
        section_order: section.order || 0,
        product_ids: section.productIds || [],
      }));

      const { error: sectionsError } = await supabase
        .from('sections')
        .insert(sectionsToInsert);
      
      if (sectionsError) throw sectionsError;
    }

    // 5. Deletar tags antigas e inserir novas
    const { error: deleteTagsError } = await supabase
      .from('tags')
      .delete()
      .eq('bakery_id', bakeryId);
    
    if (deleteTagsError) throw deleteTagsError;

    if (sanitizedData.tags && sanitizedData.tags.length > 0) {
      const tagsToInsert = sanitizedData.tags.map((tag) => ({
        id: tag.id,
        bakery_id: bakeryId,
        name: tag.name,
        color: tag.color,
        emoji: tag.emoji,
      }));

      const { error: tagsError } = await supabase
        .from('tags')
        .insert(tagsToInsert);
      
      if (tagsError) throw tagsError;
    }

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao salvar no Supabase:', error);
    throw error;
  }
}

export async function loadDataFromSupabase(bakeryId: string): Promise<AppData | null> {
  try {
    console.log('📥 Carregando dados do Supabase...', { bakeryId });

    // 1. Carregar bakery
    const { data: bakery, error: bakeryError } = await supabase
      .from('bakeries')
      .select('*')
      .eq('id', bakeryId)
      .single();

    if (bakeryError || !bakery) {
      console.error('❌ Erro ao carregar bakery:', bakeryError);
      return null;
    }
    console.log('✅ Bakery carregada:', bakery);

    // 2. Carregar produtos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('bakery_id', bakeryId)
      .order('product_order', { ascending: true });

    if (productsError) {
      console.error('❌ Erro ao carregar produtos:', productsError);
    }
    console.log('✅ Produtos carregados:', products?.length || 0);

    // 3. Carregar extras
    const { data: extras, error: extrasError } = await supabase
      .from('extras')
      .select('*')
      .eq('bakery_id', bakeryId)
      .order('extra_order', { ascending: true });

    if (extrasError) {
      console.error('❌ Erro ao carregar extras:', extrasError);
    }
    console.log('✅ Extras carregados:', extras?.length || 0);

    // 4. Carregar sections
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .eq('bakery_id', bakeryId)
      .order('section_order', { ascending: true });

    if (sectionsError) {
      console.error('❌ Erro ao carregar sections:', sectionsError);
    }
    console.log('✅ Sections carregadas:', sections?.length || 0);

    // 5. Carregar tags
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .eq('bakery_id', bakeryId);

    if (tagsError) {
      console.error('❌ Erro ao carregar tags:', tagsError);
    }
    console.log('✅ Tags carregadas:', tags?.length || 0);

    // 6. Montar AppData - SEM DEFAULTS, apenas dados do Supabase
    console.log('🔍 Settings do banco:', bakery.settings);
    console.log('🔍 Nome da confeitaria:', bakery.confectionery_name);
    
    const appData: AppData = {
      settings: bakery.settings || {
        brandName: bakery.confectionery_name || '',
        showLogo: false,
        showName: false,
        showHeroLogo: false,
        heroImagePosition: 'center',
        heroOverlayColor: '#000000',
        heroOverlayOpacity: 0.5,
        heroTitle: '',
        heroSubtitle: '',
        whatsappNumber: '',
        whatsappMessage: '',
        aboutTitle: '',
        aboutText: '',
        showAbout: false,
        extraInfoTitle: '',
        extraInfoText: '',
        showExtraInfo: false,
        footerText: '',
        adminPassword: '',
      },
      products: (products || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        image: p.image_url,
        showImage: p.show_image !== false,
        tags: (p.tags as string[]) || [],
        order: p.product_order || 0,
        sizes: (p.sizes as any) || [{ id: 'default', name: 'Padrão', price: Number(p.price) }],
      })),
      extras: (extras || []).map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description || '',
        image: e.image_url,
        price: Number(e.price),
        order: e.extra_order || 0,
      })),
      sections: (sections || []).map((s) => ({
        id: s.id,
        name: s.name,
        visible: s.visible !== false,
        order: s.section_order || 0,
        productIds: (s.product_ids as string[]) || [],
      })),
      tags: (tags || []).map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        emoji: t.emoji || '',
      })),
    };

    console.log('✅ Dados completos carregados do Supabase:', appData);
    return appData;
  } catch (error) {
    console.error('❌ Erro geral ao carregar do Supabase:', error);
    return null;
  }
}
