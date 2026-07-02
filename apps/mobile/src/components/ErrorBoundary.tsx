import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Root error boundary: a render-phase throw anywhere in the tree used to
 * white-screen the whole app. Shows a recover screen with retry instead.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Něco se pokazilo</Text>
        <Text style={styles.detail} numberOfLines={3}>
          {this.state.error.message}
        </Text>
        <Pressable style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>Zkusit znovu</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  detail: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  button: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#052E16', fontSize: 16, fontWeight: '700' },
});
