import { StyleSheet } from 'react-native';

export const formStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#101828',
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  button: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});